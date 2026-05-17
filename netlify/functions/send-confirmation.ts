import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });

export default async function handler(req: Request) {
  console.log("[send-confirmation] Function invoked");
  console.log("[send-confirmation] Method:", req.method);
  console.log("[send-confirmation] Headers:", Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    console.log("[send-confirmation] Handling CORS preflight");
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
    console.log("[send-confirmation] Method not allowed:", req.method);
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.text();
    console.log("[send-confirmation] Request body:", body);
    
    const { user_id, email } = JSON.parse(body);

    if (!user_id || !email) {
      console.error("[send-confirmation] Missing required fields:", { user_id, email });
      return json({ success: false, error: "Missing required fields" }, 400);
    }

    console.log("[send-confirmation] Processing for user_id:", user_id, "email:", email);

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[send-confirmation] Missing Supabase configuration");
      return json({ success: false, error: "Server configuration error" }, 500);
    }

    console.log("[send-confirmation] Connecting to Supabase");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    console.log("[send-confirmation] Checking for existing subscription");
    const { data: existing, error: fetchError } = await supabase
      .from("subscriptions")
      .select("confirmation_token, status")
      .eq("user_id", user_id)
      .maybeSingle();

    if (fetchError) {
      console.error("[send-confirmation] Error fetching subscription:", fetchError);
      return json({ success: false, error: "Failed to fetch subscription" }, 500);
    }

    let token: string;

    if (existing) {
      const row = existing as unknown as { confirmation_token: string; status: string };
      console.log("[send-confirmation] Existing subscription found with status:", row.status);
      if (row.status === "active") {
        console.log("[send-confirmation] Subscription already active, no email needed");
        return json({ success: true, error: null });
      }
      token = row.confirmation_token;
      console.log("[send-confirmation] Using existing token");
    } else {
      token = randomBytes(32).toString("hex");
      console.log("[send-confirmation] Generated new token");
      
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id,
          email,
          confirmation_token: token,
          status: "pending",
        });

      if (insertError) {
        console.error("[send-confirmation] Failed to create subscription:", insertError);
        return json({ success: false, error: "Failed to create subscription" }, 500);
      }
      console.log("[send-confirmation] Created new subscription with pending status");
    }

    const baseUrl = process.env.URL || "http://localhost:8080";
    const confirmationUrl = `${baseUrl}/confirm?token=${token}`;
    console.log("[send-confirmation] Confirmation URL:", confirmationUrl);

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!resendApiKey) {
      console.error("[send-confirmation] Missing RESEND_API_KEY environment variable");
      return json({ success: false, error: "Email service not configured" }, 500);
    }

    console.log("[send-confirmation] Initializing Resend client");
    const resend = new Resend(resendApiKey);

    const htmlBody = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; color: #e2e8f0;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #4ade80; font-size: 28px; margin: 0;">💧 AquaFlow</h1>
          <p style="color: #94a3b8; margin-top: 8px;">Smart Irrigation for a Greener Tomorrow</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 16px; font-size: 16px;">Hello,</p>
          <p style="margin: 0 0 16px; font-size: 16px;">Thank you for registering with <strong style="color: #4ade80;">AquaFlow</strong>.</p>
          <p style="margin: 0 0 16px; font-size: 16px;">To activate your automated irrigation system, please confirm your subscription to our service.</p>
          <div style="background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.2); border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #94a3b8;">Subscription Details:</p>
            <p style="margin: 0 0 4px; font-size: 15px;"><strong>Plan:</strong> AquaFlow Smart Irrigation</p>
            <p style="margin: 0 0 4px; font-size: 15px;"><strong>Price:</strong> ₱499 per month</p>
            <p style="margin: 0; font-size: 15px;"><strong>Includes:</strong> System monitoring, automation, and maintenance support</p>
          </div>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #4ade80, #38bdf8); color: #0f172a; font-size: 16px; font-weight: 600; padding: 14px 40px; border-radius: 8px; text-decoration: none; border: none; cursor: pointer;">Confirm Subscription</a>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 24px;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #38bdf8; word-break: break-all;">${confirmationUrl}</p>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 16px;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">If you did not request this, you may ignore this email.</p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">Thank you,<br><strong style="color: #94a3b8;">AquaFlow Team</strong></p>
        </div>
      </div>
    `;

    console.log("[send-confirmation] Sending email via Resend API");
    console.log("[send-confirmation] From:", resendFromEmail);
    console.log("[send-confirmation] To:", email);

    const emailResult = await resend.emails.send({
      from: resendFromEmail,
      to: email,
      subject: "AquaFlow Subscription Confirmation",
      html: htmlBody,
    });

    console.log("[send-confirmation] Resend API response:", JSON.stringify(emailResult));

    if (emailResult.error) {
      console.error("[send-confirmation] Resend API error:", emailResult.error);
      return json({ success: false, error: `Failed to send email: ${emailResult.error.message}` }, 500);
    }

    console.log(`[send-confirmation] Confirmation email sent successfully to ${email}`);
    console.log(`[send-confirmation] Email ID: ${emailResult.data?.id}`);
    
    return json({ success: true, error: null, emailId: emailResult.data?.id });
  } catch (err) {
    console.error("[send-confirmation] Unexpected error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[send-confirmation] Error details:", errorMessage);
    return json({ success: false, error: errorMessage }, 500);
  }
}

export const config = { path: "/api/send-confirmation" };
