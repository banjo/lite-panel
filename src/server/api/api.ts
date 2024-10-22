import { Hono } from "hono";
import { appsController } from "./controllers/app-controller";
import { composeController } from "./controllers/compose-controller";
import { serverController } from "./controllers/server-controller";

export const api = new Hono()
    .route("/compose", composeController)
    .route("/apps", appsController)
    .route("/server", serverController);
