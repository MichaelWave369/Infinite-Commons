import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Imported, reviewed world art and schemas live in the repository's existing web/.
// Keep this React app a presentation layer over those shared contracts.
const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

export default defineConfig({
  base: process.env.COMMONS_BASE_PATH || "/",
  server: { fs: { allow: [repositoryRoot] } },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: false },
});
