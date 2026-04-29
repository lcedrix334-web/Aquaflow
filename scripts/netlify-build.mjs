import { cpSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

const distDir = join(process.cwd(), "dist");
const clientDir = join(distDir, "client");
const serverDir = join(distDir, "server");
const functionsDir = join(process.cwd(), "netlify", "functions");

// Ensure functions directory exists
mkdirSync(functionsDir, { recursive: true });

// Copy server files into functions directory so Netlify can bundle them
const serverFnDir = join(functionsDir, "server-dist");
mkdirSync(serverFnDir, { recursive: true });
cpSync(serverDir, serverFnDir, { recursive: true });

// Create the Netlify serverless function entry point
const functionCode = `import server from "./server-dist/server.js";

export default async (req, context) => {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["host"] || "localhost";
  const url = new URL(req.url, protocol + "://" + host);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, typeof value === "string" ? value : value.join(", "));
    }
  }

  const init = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  const webRequest = new Request(url.toString(), init);
  const response = await server.fetch(webRequest);

  const responseHeaders = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const config = {
  path: "/*",
  included_files: ["server-dist/**"],
};
`;

writeFileSync(join(functionsDir, "server.js"), functionCode);

// Create a simple index.html fallback in dist/client for static asset serving
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AquaFlow</title>
  <link rel="stylesheet" href="/assets/styles-DMjvbdd9.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index-3tDtFQjf.js"></script>
</body>
</html>
`;

writeFileSync(join(clientDir, "index.html"), indexHtml);

console.log("Netlify build post-processing complete.");
console.log("- Server files copied to netlify/functions/server-dist/");
console.log("- Serverless function created at netlify/functions/server.js");
console.log("- Fallback index.html created in dist/client/");
