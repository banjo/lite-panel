import { SystemService } from "@/server/common/services/system-service";
import { createLogger } from "@/utils/logger";
import { Hono } from "hono";
import { ErrorResponse, SuccessResponse } from "../controller-model";

const logger = createLogger("system-controller");

export const systemController = new Hono().get("/info", async c => {
    logger.info("Received request to get system information");

    const systemInfoResult = await SystemService.getInfo();

    if (!systemInfoResult.success) {
        logger.error({ message: systemInfoResult.message }, "Failed to get apps");
        return ErrorResponse(c, { message: systemInfoResult.message });
    }

    return SuccessResponse(c, systemInfoResult.data);
});
