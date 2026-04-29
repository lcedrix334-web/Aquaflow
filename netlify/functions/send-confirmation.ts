import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";

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

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      return Response.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

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

    await transporter.sendMail({
      from: `"AquaFlow" <${gmailUser}>`,
      to: email,
      subject: "AquaFlow Subscription Confirmation",
      html: htmlBody,
    });

    console.log(`Confirmation email sent to ${email}`);
    return Response.json({ success: true, error: null });
  } catch (err) {
    console.error("send-confirmation error:", err);
    return Response.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export const config = { path: "/api/send-confirmation" };
