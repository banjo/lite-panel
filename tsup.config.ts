import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: "esm",
    outDir: "build",
    splitting: false,
    sourcemap: false,
    clean: true,
});
