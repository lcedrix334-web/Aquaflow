import { createClient } from "@supabase/supabase-js";

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.text();
    const { token } = JSON.parse(body);

    if (!token) {
      return json({ success: false, error: "Missing token" }, 400);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return json({ success: false, error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id, user_id, email, status")
      .eq("confirmation_token", token)
      .maybeSingle();

    if (fetchError || !subscription) {
      return json({ success: false, error: "Invalid or expired confirmation token" });
    }

    const sub = subscription as unknown as { id: string; status: string; email: string };

    if (sub.status === "active") {
      return json({ success: true, email: sub.email, error: null });
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", sub.id);

    if (updateError) {
      return json({ success: false, error: "Failed to activate subscription" }, 500);
    }

    return json({ success: true, email: sub.email, error: null });
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
}

export const config = { path: "/api/confirm-subscription" };
