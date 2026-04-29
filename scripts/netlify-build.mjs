import { mkdirSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const distDir = join(process.cwd(), "dist");
const clientDir = join(distDir, "client");
const functionsDir = join(process.cwd(), "netlify", "functions");

// ── 1. Generate index.html from built client assets ──
const assetsDir = join(clientDir, "assets");
const assetFiles = readdirSync(assetsDir);

const cssFile = assetFiles.find(f => f.endsWith(".css"));
const jsEntry = assetFiles.find(f => f.startsWith("index-") && f.endsWith(".js"));

const indexHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AquaFlow</title>
  <meta name="description" content="AquaFlow is an automated ESP32 irrigation system that delivers the right amount of water at the right time using soil moisture sensors." />
${cssFile ? `  <link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
  <script type="module" src="/assets/${jsEntry}"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;

writeFileSync(join(clientDir, "index.html"), indexHtml);
console.log("Created dist/client/index.html");

// ── 2. Create self-contained Netlify API functions ──
mkdirSync(functionsDir, { recursive: true });

// send-confirmation function
const sendConfirmationFn = `import { createClient } from "@supabase/supabase-js";
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
`;

writeFileSync(join(functionsDir, "send-confirmation.js"), sendConfirmationFn);

// confirm-subscription function
const confirmSubscriptionFn = `import { createClient } from "@supabase/supabase-js";

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
`;

writeFileSync(join(functionsDir, "confirm-subscription.js"), confirmSubscriptionFn);

console.log("Created Netlify API functions");
console.log("Netlify build post-processing complete.");
