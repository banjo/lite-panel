import { Hono } from "hono";
import { dockerController } from "./controllers/docker-controller";
import { NotFoundResponse, SuccessResponse } from "./controller-model";

export const api = new Hono().route("/docker", dockerController).get("/hello", c => {
    const random = Math.random();
    return NotFoundResponse(c, { message: "Not found" });
    if (random < 0.5) {
        return NotFoundResponse(c, { message: "Not found" });
    }
    return SuccessResponse(c, { sweden: "Hello" });
});
