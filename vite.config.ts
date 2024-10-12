import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                entryFileNames: "client.js",
            },
        },
    },
    plugins: [tsconfigPaths()],
});
