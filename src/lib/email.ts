// Gmail SMTP client using Node's built-in tls module
// (nodemailer doesn't work in Vite SSR environment)

export async function sendConfirmationEmail(
  toEmail: string,
  confirmationUrl: string
): Promise<{ success: boolean; error: string | null }> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD env vars");
    return { success: false, error: "Email service not configured" };
  }

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

  try {
    const tls = await import("node:tls");

    return new Promise((resolve) => {
      const socket = tls.connect({
        host: "smtp.gmail.com",
        port: 465,
      }, () => {
        let step = 0;

        socket.on("data", (data: Buffer) => {
          const text = data.toString();

          if (step === 0 && text.startsWith("220")) {
            socket.write("EHLO aquaflow\r\n");
            step = 1;
          } else if (step === 1 && text.includes("250 ")) {
            socket.write("AUTH LOGIN\r\n");
            step = 2;
          } else if (step === 2 && text.startsWith("334")) {
            socket.write(Buffer.from(gmailUser).toString("base64") + "\r\n");
            step = 3;
          } else if (step === 3 && text.startsWith("334")) {
            socket.write(Buffer.from(gmailAppPassword).toString("base64") + "\r\n");
            step = 4;
          } else if (step === 4 && text.startsWith("235")) {
            socket.write(`MAIL FROM:<${gmailUser}>\r\n`);
            step = 5;
          } else if (step === 5 && text.startsWith("250")) {
            socket.write(`RCPT TO:<${toEmail}>\r\n`);
            step = 6;
          } else if (step === 6 && text.startsWith("250")) {
            socket.write("DATA\r\n");
            step = 7;
          } else if (step === 7 && text.startsWith("354")) {
            const email = [
              `From: AquaFlow <${gmailUser}>`,
              `To: ${toEmail}`,
              `Subject: =?utf-8?B?${Buffer.from("AquaFlow Subscription Confirmation").toString("base64")}?=`,
              "MIME-Version: 1.0",
              'Content-Type: text/html; charset="utf-8"',
              "",
              htmlBody,
              ".",
              "",
            ].join("\r\n");
            socket.write(email);
            step = 8;
          } else if (step === 8 && text.startsWith("250")) {
            socket.write("QUIT\r\n");
            step = 9;
          } else if (step === 9) {
            socket.destroy();
            console.log(`Confirmation email sent to ${toEmail}`);
            resolve({ success: true, error: null });
          } else if (text.startsWith("5") || text.startsWith("4")) {
            console.error("SMTP error:", text.trim());
            socket.write("QUIT\r\n");
            socket.destroy();
            resolve({ success: false, error: `SMTP error: ${text.trim()}` });
          }
        });

        socket.on("error", (err: Error) => {
          console.error("Socket error:", err);
          resolve({ success: false, error: err.message });
        });

        socket.on("close", () => {
          if (step < 9) {
            resolve({ success: false, error: "Connection closed unexpectedly" });
          }
        });
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Email send error:", message);
    return { success: false, error: message };
  }
}
