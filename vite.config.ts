import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    ssr: false,
  },
  vite: {
    base: "./",
    build: {
      outDir: "dist",
      rollupOptions: {
        input: "index.html",
      },
    },
  },
});
