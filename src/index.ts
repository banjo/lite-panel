import { serve } from "@hono/node-server";
import { app } from "./server/app";
import "dotenv/config";
import { Env } from "./utils/env";
import { isProduction } from "./utils/runtime";

const port = Env.PORT || 3009;
console.log(
  `Server is running on ${isProduction ? "production" : "development"} on http://localhost:${port}`,
);
serve({
  fetch: app.fetch,
  port,
});
