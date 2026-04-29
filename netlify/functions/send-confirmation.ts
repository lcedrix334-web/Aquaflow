import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { sendConfirmationEmail } from "../../src/lib/email";

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
    const { user_id, email } = await req.json();

    if (!user_id || !email) {
      return Response.json(
        { success: false, error: "Missing required fields" },
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

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("confirmation_token, status")
      .eq("user_id", user_id)
      .single();

    let token: string;

    if (existing) {
      const row = existing as unknown as { confirmation_token: string; status: string };
      if (row.status === "active") {
        return Response.json({ success: true, error: null });
      }
      token = row.confirmation_token;
    } else {
      token = randomBytes(32).toString("hex");
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id,
          email,
          confirmation_token: token,
          status: "pending",
        });

      if (insertError) {
        return Response.json(
          { success: false, error: "Failed to create subscription" },
          { status: 500 }
        );
      }
    }

    const baseUrl = process.env.URL || "http://localhost:8080";
    const confirmationUrl = `${baseUrl}/confirm?token=${token}`;
    const result = await sendConfirmationEmail(email, confirmationUrl);

    return Response.json(result);
  } catch (err) {
    return Response.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export const config = { path: "/api/send-confirmation" };
