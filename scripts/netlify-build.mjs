import { cpSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const distDir = join(process.cwd(), "dist");
const clientDir = join(distDir, "client");
const serverDir = join(distDir, "server");
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
  <title>AquaFlow — Smart Irrigation for a Greener Tomorrow</title>
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
console.log("✓ Created dist/client/index.html");

// ── 2. Create Netlify API functions ──
mkdirSync(functionsDir, { recursive: true });

// Copy server-side source files that the API handlers need
const apiFnDir = join(functionsDir, "api-src");
mkdirSync(apiFnDir, { recursive: true });

// Copy the API handler source files
cpSync(
  join(process.cwd(), "src", "api"),
  join(apiFnDir, "api"),
  { recursive: true }
);
cpSync(
  join(process.cwd(), "src", "lib", "email.ts"),
  join(apiFnDir, "lib", "email.ts"),
  { force: true }
);
cpSync(
  join(process.cwd(), "src", "integrations", "types.ts"),
  join(apiFnDir, "integrations", "types.ts"),
  { force: true }
);

// Create send-confirmation Netlify function
const sendConfirmationFn = `import handler from "./api-src/api/send-confirmation.ts";

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

    const parsed = JSON.parse(body);
    const result = await handler(parsed);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: String(err) }),
    };
  }
};

export const config = {
  path: "/api/send-confirmation";
};
`;

writeFileSync(join(functionsDir, "send-confirmation.js"), sendConfirmationFn);

// Create confirm-subscription Netlify function
const confirmSubscriptionFn = `import handler from "./api-src/api/confirm-subscription.ts";

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

    const parsed = JSON.parse(body);
    const result = await handler(parsed);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: String(err) }),
    };
  }
};

export const config = {
  path: "/api/confirm-subscription";
};
`;

writeFileSync(join(functionsDir, "confirm-subscription.js"), confirmSubscriptionFn);

console.log("✓ Created Netlify API functions");
console.log("Netlify build post-processing complete.");
