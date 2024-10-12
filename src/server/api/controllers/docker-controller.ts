import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { DockerService } from "@/server/common/services/docker-service";
import { ErrorResponse, SuccessResponse } from "../controller-model";

const dockerStartSchema = z.object({
    path: z.string(),
});

export const dockerController = new Hono()
    .post("/start", zValidator("json", dockerStartSchema), async c => {
        const { path } = c.req.valid("json");
        const result = await DockerService.stop({ path });

        if (!result.success) {
            return ErrorResponse(c, { message: result.message });
        }

        return SuccessResponse(c, { result });
    })
    .get("/test", async c => {
        return c.json({ message: "Hello test" });
    });
