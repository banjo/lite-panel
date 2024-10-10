import { serve } from "@hono/node-server";
import "dotenv/config";
import { app } from "./server/app";
import { Env } from "./utils/env";
import { isProduction } from "./utils/runtime";

const env = Env.server();
export const port = env.PORT;

console.log(
    `🚀 Server is running on ${isProduction ? "production" : "development"} on http://localhost:${port}`
);
serve({
    fetch: app.fetch,
    port,
});
