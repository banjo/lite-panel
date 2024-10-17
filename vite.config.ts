import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { first } from "@banjoanton/utils";

export default defineConfig({
    build: {
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                entryFileNames: "assets/client.js",
                assetFileNames: ({ names }) => {
                    if (first(names) === "style.css") {
                        return "assets/style.css";
                    }
                    // Default format for other asset types
                    return "assets/[name].[hash][extname]";
                },
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
