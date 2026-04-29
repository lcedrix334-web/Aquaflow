import { writeFileSync, readdirSync, readFileSync, statSync, cpSync, rmSync, existsSync } from "fs";
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

// ── 2. Patch client entry JS for pure SPA mode (no SSR hydration) ──
const entryJsPath = join(assetsDir, jsEntry);
let entryJs = readFileSync(entryJsPath, "utf-8");

// Patch 1: Replace hydrateRoot(document,jsx) with createRoot(container).render(jsx)
entryJs = entryJs.replace(
  /\.hydrateRoot\(document,/,
  ".createRoot(document.getElementById('root')).render("
);

// Patch 2: Skip SSR hydration — the E1 function requires window.$_TSR which only exists
// when the server pre-renders the page. In pure SPA mode, this data doesn't exist,
// causing "Invariant failed" at runtime.
// The code pattern is: n.stores.matchesId.get().length||await E1(n)
// We change it to skip E1 entirely: n.stores.matchesId.get().length||void 0
entryJs = entryJs.replace(
  /\.get\(\)\.length\|\|await [A-Za-z0-9_$]+\(/g,
  ".get().length||void 0;void ("
);

// Patch 3: Ensure window.$_TSR exists to prevent other invariant checks from failing
const tsrPolyfill = 'window.$_TSR||(window.$_TSR={router:{matches:[],lastMatchId:0,manifest:{},dehydratedData:null},buffer:[],initialized:!0,h:function(){}});';
entryJs = tsrPolyfill + entryJs;

writeFileSync(entryJsPath, entryJs);
console.log("Patched client entry: SSR hydration disabled, SPA mode enabled");

// ── 3. Move client files to dist/ root (flatten structure) ──
writeFileSync(join(distDir, "index.html"), indexHtml);
console.log("Created dist/index.html");

writeFileSync(join(distDir, "_redirects"), "/*    /index.html   200\n");
console.log("Created dist/_redirects");

const distAssetsDir = join(distDir, "assets");
if (existsSync(distAssetsDir)) {
  rmSync(distAssetsDir, { recursive: true });
}
cpSync(assetsDir, distAssetsDir, { recursive: true });
console.log("Copied assets/ to dist/ root");

rmSync(clientDir, { recursive: true });
console.log("Removed dist/client/");

const serverDir = join(distDir, "server");
if (existsSync(serverDir)) {
  rmSync(serverDir, { recursive: true });
  console.log("Removed dist/server/");
}

console.log("Netlify build post-processing complete.");
