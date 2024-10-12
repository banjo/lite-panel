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
    "/*",
    serveStatic({
        rewriteRequestPath: path => `./dist${path}`,
    })
);

if (isProduction) {
    app.get("*", c => {
        return c.html(
            renderToString(
                <html>
                    <head>
                        <meta charSet="utf-8" />
                        <meta content="width=device-width, initial-scale=1" name="viewport" />
                        <title>Lite panel</title>
                        <script type="module" src="/client.js" />
                    </head>
                    <body>
                        <div id="root" />
                    </body>
                </html>
            )
        );
    });
}

// if (!isProduction) {
//     app.use("/*", async c => {
//         return c.redirect("/");
//     });
// }

export type AppType = typeof app;
