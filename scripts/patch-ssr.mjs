import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Patch routeTree.gen.ts to disable SSR before vite build runs
const routeTreePath = join(process.cwd(), "src", "routeTree.gen.ts");
let routeTree = readFileSync(routeTreePath, "utf-8");

if (routeTree.includes("ssr: true")) {
  routeTree = routeTree.replace("ssr: true", "ssr: false");
  writeFileSync(routeTreePath, routeTree);
  console.log("patch-ssr: set ssr:false in routeTree.gen.ts");
} else {
  console.log("patch-ssr: ssr already false, no change needed");
}
