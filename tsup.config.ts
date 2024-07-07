import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["cjs"],
  outDir: "rplugin/node/nostr",
  clean: true,
});
