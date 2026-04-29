import { createClient } from "@supabase/supabase-js";

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return Response.json(
        { success: false, error: "Missing token" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id, user_id, email, status")
      .eq("confirmation_token", token)
      .single();

    if (fetchError || !subscription) {
      return Response.json({ success: false, error: "Invalid or expired confirmation token" });
    }

    const sub = subscription as unknown as { id: string; status: string; email: string };

    if (sub.status === "active") {
      return Response.json({ success: true, email: sub.email, error: null });
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", sub.id);

    if (updateError) {
      return Response.json(
        { success: false, error: "Failed to activate subscription" },
        { status: 500 }
      );
    }

    return Response.json({ success: true, email: sub.email, error: null });
  } catch (err) {
    return Response.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export const config = { path: "/api/confirm-subscription" };
