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

const getBySlugSchema = z.object({
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
    .post("/restart", zValidator("json", getBySlugSchema), async c => {
        logger.info("Received request to restart a docker compose app");
        const body = c.req.valid("json");

        const restartResult = await DockerComposeService.restartApp(body.slug);

        if (!restartResult.success) {
            logger.error({ message: restartResult.message }, "Failed to restart app");
            return ErrorResponse(c, { message: restartResult.message });
        }

        return SuccessResponse(c, restartResult.data);
    })
    .get("/get/:slug", zValidator("query", getBySlugSchema), async c => {
        logger.info("Received request to get a docker compose app");
        const { slug } = c.req.valid("query");

        const getResult = await DockerComposeService.getApp(slug);

        if (!getResult.success) {
            logger.error({ message: getResult.message }, "Failed to get app");
            return ErrorResponse(c, { message: getResult.message });
        }

        return SuccessResponse(c, getResult.data);
    });
