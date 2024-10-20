import { Hono } from "hono";
import { composeController } from "./controllers/compose-controller";
import { NotFoundResponse, SuccessResponse } from "./controller-model";
import { appsController } from "./controllers/app-controller";
import { serverController } from "./controllers/server-controller";

export const api = new Hono()
    .route("/compose", composeController)
    .route("/apps", appsController)
    .route("/server", serverController)
    .get("/hello", c => {
        const random = Math.random();
        if (random < 0.5) {
            return NotFoundResponse(c, { message: "Not found" });
        }
        return SuccessResponse(c, { sweden: "Hello" });
    });
