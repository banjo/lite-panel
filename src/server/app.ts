import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { api } from "./api/api";

export const app = new Hono().route("/api", api);

app.use(
  "/*",
  serveStatic({
    rewriteRequestPath: (path) => `./dist${path}`,
  }),
);

export type AppType = typeof app;
