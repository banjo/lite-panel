import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                entryFileNames: "client.js",
            },
        },
    },
});
