import { writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";

const distDir = join(process.cwd(), "dist");

// ── 1. Create _redirects for SPA routing ──
writeFileSync(join(distDir, "_redirects"), "/*    /index.html   200\n");
console.log("Created dist/_redirects");

// ── 2. Remove server build output (not needed for SPA) ──
const serverDir = join(distDir, "server");
if (existsSync(serverDir)) {
  rmSync(serverDir, { recursive: true });
  console.log("Removed dist/server/");
}

console.log("Netlify build post-processing complete.");
