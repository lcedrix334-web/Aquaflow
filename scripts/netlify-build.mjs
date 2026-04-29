import { writeFileSync, readdirSync, readFileSync, statSync, cpSync } from "fs";
import { join } from "path";

const distDir = join(process.cwd(), "dist");
const clientDir = join(distDir, "client");

// ── 1. Generate index.html from built client assets ──
const assetsDir = join(clientDir, "assets");
const assetFiles = readdirSync(assetsDir);

const cssFile = assetFiles.find(f => f.endsWith(".css"));
// Find the main entry JS (largest index-*.js — route components also start with "index-" but are smaller)
const indexJsFiles = assetFiles.filter(f => f.startsWith("index-") && f.endsWith(".js"));
let jsEntry = indexJsFiles[0];
if (indexJsFiles.length > 1) {
  jsEntry = indexJsFiles.reduce((largest, f) => {
    const size = statSync(join(assetsDir, f)).size;
    const largestSize = statSync(join(assetsDir, largest)).size;
    return size > largestSize ? f : largest;
  });
}

const indexHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AquaFlow</title>
  <meta name="description" content="AquaFlow is an automated ESP32 irrigation system that delivers the right amount of water at the right time using soil moisture sensors." />
${cssFile ? `  <link rel="stylesheet" href="./assets/${cssFile}" />` : ""}
  <script type="module" src="./assets/${jsEntry}"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;

writeFileSync(join(clientDir, "index.html"), indexHtml);
console.log("Created dist/client/index.html");

// ── 1b. Patch client entry: replace hydrateRoot with createRoot for SPA mode ──
const entryJsPath = join(assetsDir, jsEntry);
let entryJs = readFileSync(entryJsPath, "utf-8");

// Replace hydrateRoot(document,...) with createRoot(document).render(...)
// Pattern: something.hydrateRoot(document,jsx) => something.createRoot(document).render(jsx)
entryJs = entryJs.replace(
  /\.hydrateRoot\(document,/,
  ".createRoot(document).render("
);

writeFileSync(entryJsPath, entryJs);
console.log("Patched client entry: hydrateRoot -> createRoot");

// ── 2. Create _redirects file for SPA routing ──
writeFileSync(join(clientDir, "_redirects"), "/*    /index.html   200\n");
console.log("Created dist/client/_redirects for SPA routing");

// ── 3. Copy client files to dist/ root as fallback ──
// If Netlify UI overrides netlify.toml and publishes "dist" instead of "dist/client",
// the correct index.html and assets must exist at dist/ root level.

// Copy index.html
writeFileSync(join(distDir, "index.html"), indexHtml);
console.log("Copied index.html to dist/ root");

// Copy _redirects
writeFileSync(join(distDir, "_redirects"), "/*    /index.html   200\n");
console.log("Copied _redirects to dist/ root");

// Copy assets directory
cpSync(join(clientDir, "assets"), join(distDir, "assets"), { recursive: true });
console.log("Copied assets/ to dist/ root");

console.log("Netlify build post-processing complete.");
