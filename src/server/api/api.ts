import { Hono } from "hono";
import { composeController } from "./controllers/docker-compose-controller";
import { NotFoundResponse, SuccessResponse } from "./controller-model";
import { appController } from "./controllers/app-controller";

export const api = new Hono()
    .route("/compose", composeController)
    .route("/app", appController)
    .get("/hello", c => {
        const random = Math.random();
        if (random < 0.5) {
            return NotFoundResponse(c, { message: "Not found" });
        }
        return SuccessResponse(c, { sweden: "Hello" });
    });
