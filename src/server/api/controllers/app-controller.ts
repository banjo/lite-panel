import { AppService } from "@/server/common/services/app-service";
import { createLogger } from "@/utils/logger";
import { Hono } from "hono";
import { ErrorResponse, SuccessResponse } from "../controller-model";

const logger = createLogger("app-controller");

export const appController = new Hono().get("/get", async c => {
    logger.info("Received request to get all apps");

    const appsResult = await AppService.getAll();

    if (!appsResult.success) {
        logger.error({ message: appsResult.message }, "Failed to get apps");
        return ErrorResponse(c, { message: appsResult.message });
    }

    return SuccessResponse(c, appsResult.data);
});
