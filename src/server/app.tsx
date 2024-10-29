import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { renderToString } from "react-dom/server";
import { isProduction } from "../utils/runtime";
import { api } from "./api/api";
import { NotFoundResponse } from "./api/controller-model";

export const app = new Hono()
    .use(cors())
    .route("/api", api)
    .notFound(c => NotFoundResponse(c, { message: "Not found" }));

app.use(logger());

app.use(
    "/assets/*",
    serveStatic({
        rewriteRequestPath: path => `./dist${path}`,
    })
);

if (isProduction) {
    app.get("*", c =>
        c.html(
            renderToString(
                <html>
                    <head>
                        <meta charSet="utf-8" />
                        <meta content="width=device-width, initial-scale=1" name="viewport" />
                        <title>Litepanel</title>
                        <script type="module" src="/assets/client.js" />
                        <link rel="stylesheet" href="/assets/style.css" />
                    </head>
                    <body>
                        <div id="root" />
                    </body>
                </html>
            )
        )
    );
}

export type AppType = typeof app;
