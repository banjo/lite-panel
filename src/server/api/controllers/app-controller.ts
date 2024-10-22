import { AppService } from "@/server/common/services/app-service";
import { createLogger } from "@/utils/logger";
import { Hono } from "hono";
import { ErrorResponse, SuccessResponse } from "../controller-model";
import { zValidator } from "@hono/zod-validator";
import { getBySlugSchema } from "@/models/get-by-slug-schema";

const logger = createLogger("app-controller");

export const appsController = new Hono()
    .get("/", async c => {
        logger.info("Received request to get all apps");

        const appsResult = await AppService.getAll();

        if (!appsResult.success) {
            logger.error({ message: appsResult.message }, "Failed to get apps");
            return ErrorResponse(c, { message: appsResult.message });
        }

        return SuccessResponse(c, appsResult.data);
    })
    .post("/stop", zValidator("json", getBySlugSchema), async c => {
        const { slug } = c.req.valid("json");
        logger.info({ slug }, "Received request to stop app");

        const stopResult = await AppService.stop(slug);

        if (!stopResult.success) {
            logger.error({ message: stopResult.message, slug }, "Failed to stop app");
            return ErrorResponse(c, { message: stopResult.message });
        }

        return SuccessResponse(c);
    })
    .post("/start", zValidator("json", getBySlugSchema), async c => {
        const { slug } = c.req.valid("json");
        logger.info({ slug }, "Received request to start app");

        const startResult = await AppService.start(slug);

        if (!startResult.success) {
            logger.error({ message: startResult.message, slug }, "Failed to start app");
            return ErrorResponse(c, { message: startResult.message });
        }

        return SuccessResponse(c);
    });
