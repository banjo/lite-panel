import { createLogger } from "@/utils/logger";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { ErrorResponse, SuccessResponse } from "../controller-model";
import { DockerComposeService } from "@/server/common/services/docker-compose-service";

const logger = createLogger("docker-controller");

const createSchema = z.object({
    dockerComposeContent: z.string(),
    name: z.string(),
    domain: z.string(),
    ports: z.array(z.number()),
});

const restartSchema = z.object({
    slug: z.string(),
});

export const dockerComposeController = new Hono()
    .post("/create", zValidator("json", createSchema), async c => {
        logger.info("Received request to create a docker compose app");
        const body = c.req.valid("json");

        const createResult = await DockerComposeService.createApp({
            name: body.name,
            domain: body.domain,
            type: "DOCKER_COMPOSE",
            meta: {
                composeFileContent: body.dockerComposeContent,
            },
            proxies: body.ports.map(port => ({ port })),
        });

        if (!createResult.success) {
            logger.error({ message: createResult.message }, "Failed to create app");
            return ErrorResponse(c, { message: createResult.message });
        }

        return SuccessResponse(c, createResult.data);
    })
    .post("/restart", zValidator("json", restartSchema), async c => {
        logger.info("Received request to restart a docker compose app");
        const body = c.req.valid("json");

        const restartResult = await DockerComposeService.restartApp(body.slug);

        if (!restartResult.success) {
            logger.error({ message: restartResult.message }, "Failed to restart app");
            return ErrorResponse(c, { message: restartResult.message });
        }

        return SuccessResponse(c, restartResult.data);
    })
    .get("/test", async c => {
        return c.json({ message: "Hello test" });
    });
