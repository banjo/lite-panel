import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "build",
    splitting: false,
    sourcemap: false,
    clean: true,
});
