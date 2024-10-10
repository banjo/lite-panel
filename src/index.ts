import { serve } from "@hono/node-server";
import { app } from "./server/app";
import "dotenv/config";

const port = 3009;
console.log(`Server is running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});
