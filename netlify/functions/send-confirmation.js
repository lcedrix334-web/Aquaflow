import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { sendConfirmationEmail } from "../../src/lib/email.ts";

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

    const { user_id, email } = JSON.parse(body);

    if (!user_id || !email) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, error: "Missing required fields" }) };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("confirmation_token, status")
      .eq("user_id", user_id)
      .single();

    let token;
    if (existing) {
      if (existing.status === "active") {
        return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ success: true, error: null }) };
      }
      token = existing.confirmation_token;
    } else {
      token = randomBytes(32).toString("hex");
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({ user_id, email, confirmation_token: token, status: "pending" });
      if (insertError) {
        return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, error: "Failed to create subscription" }) };
      }
    }

    const baseUrl = process.env.URL || "http://localhost:8080";
    const confirmationUrl = baseUrl + "/confirm?token=" + token;
    const result = await sendConfirmationEmail(email, confirmationUrl);

    return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, error: String(err) }) };
  }
};

export const config = {
  path: "/api/send-confirmation",
};
