import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                entryFileNames: "assets/client.js",
            },
        },
    },
    plugins: [
        tsconfigPaths(),
        viteReact(),
        TanStackRouterVite({
            routesDirectory: "./src/client/routes/",
            generatedRouteTree: "./src/client/routeTree.gen.ts",
        }),
    ],
});
