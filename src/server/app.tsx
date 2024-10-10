import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { api } from "./api/api";
import { basicAuth } from "hono/basic-auth";
import { cors } from "hono/cors";

export const app = new Hono().use(cors()).route("/api", api);

app.use(logger());

app.use(
  "/*",
  // basicAuth({
  //   username: "hono",
  //   password: "hono",
  // }),
  serveStatic({
    rewriteRequestPath: (path) => `./dist${path}`,
  }),
);

app.use("/*", async (c) => {
  return c.redirect("/");
});

export type AppType = typeof app;
