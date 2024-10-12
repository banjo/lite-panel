import { Hono } from "hono";
import { dockerController } from "./controllers/docker-controller";
import { SuccessResponse } from "./controller-model";

export const api = new Hono().route("/docker", dockerController).get("/hello", c => {
    return SuccessResponse(c, { message: "Hello" });
});
