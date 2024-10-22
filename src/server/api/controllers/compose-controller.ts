import { createLogger } from "@/utils/logger";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { ErrorResponse, SuccessResponse } from "../controller-model";
import { ComposeService } from "@/server/common/services/compose-service";
import { getBySlugSchema } from "@/models/get-by-slug-schema";

const logger = createLogger("docker-controller");

const createSchema = z.object({
    dockerComposeContent: z.string(),
    name: z.string(),
    domain: z.string(),
    ports: z.array(z.number()),
});

const updateSchema = createSchema.merge(getBySlugSchema);

export const composeController = new Hono()
    .post("/create", zValidator("json", createSchema), async c => {
        logger.info("Received request to create a docker compose app");
        const body = c.req.valid("json");

        const createResult = await ComposeService.createApp({
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

        const restartResult = await ComposeService.restartApp(body.slug);

        if (!restartResult.success) {
            logger.error({ message: restartResult.message }, "Failed to restart app");
            return ErrorResponse(c, { message: restartResult.message });
        }

        return SuccessResponse(c, restartResult.data);
    })
    .get("/get/:slug", zValidator("query", getBySlugSchema), async c => {
        logger.info("Received request to get a docker compose app");
        const { slug } = c.req.valid("query");

        const getResult = await ComposeService.getApp(slug);

        if (!getResult.success) {
            logger.error({ message: getResult.message }, "Failed to get app");
            return ErrorResponse(c, { message: getResult.message });
        }

        return SuccessResponse(c, getResult.data);
    })
    .put("/update", zValidator("json", updateSchema), async c => {
        logger.info("Received request to update a docker compose app");
        const body = c.req.valid("json");

        const updateResult = await ComposeService.updateApp(body.slug, {
            name: body.name,
            domain: body.domain,
            meta: {
                composeFileContent: body.dockerComposeContent,
            },
            proxies: body.ports.map(port => ({ port })),
        });

        if (!updateResult.success) {
            logger.error({ message: updateResult.message }, "Failed to update app");
            return ErrorResponse(c, { message: updateResult.message });
        }

        return SuccessResponse(c, updateResult.data);
    })
    .delete("/delete/:slug", zValidator("query", getBySlugSchema), async c => {
        logger.info("Received request to delete a docker compose app");
        const { slug } = c.req.valid("query");

        const deleteResult = await ComposeService.deleteApp(slug);

        if (!deleteResult.success) {
            logger.error({ message: deleteResult.message }, "Failed to delete app");
            return ErrorResponse(c, { message: deleteResult.message });
        }

        return SuccessResponse(c, { success: true });
    });
