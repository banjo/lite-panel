import { Hono } from "hono";
import { dockerComposeController } from "./controllers/docker-compose-controller";
import { NotFoundResponse, SuccessResponse } from "./controller-model";

export const api = new Hono().route("/docker-compose", dockerComposeController).get("/hello", c => {
    const random = Math.random();
    return NotFoundResponse(c, { message: "Not found" });
    if (random < 0.5) {
        return NotFoundResponse(c, { message: "Not found" });
    }
    return SuccessResponse(c, { sweden: "Hello" });
});
