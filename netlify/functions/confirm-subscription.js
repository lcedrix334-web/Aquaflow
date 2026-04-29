import { createClient } from "@supabase/supabase-js";

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => { data += chunk; });
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });

    const { token } = JSON.parse(body);

    if (!token) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, error: "Missing token" }) };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id, user_id, email, status")
      .eq("confirmation_token", token)
      .single();

    if (fetchError || !subscription) {
      return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ success: false, error: "Invalid or expired confirmation token" }) };
    }

    if (subscription.status === "active") {
      return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ success: true, email: subscription.email, error: null }) };
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "active", confirmed_at: new Date().toISOString() })
      .eq("id", subscription.id);

    if (updateError) {
      return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, error: "Failed to activate subscription" }) };
    }

    return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ success: true, email: subscription.email, error: null }) };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, error: String(err) }) };
  }
};

export const config = {
  path: "/api/confirm-subscription",
};
