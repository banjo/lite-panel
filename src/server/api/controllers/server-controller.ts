import { ServerService } from "@/server/common/services/server-service";
import { createLogger } from "@/utils/logger";
import { Hono } from "hono";
import { ErrorResponse, SuccessResponse } from "../controller-model";
import { ConfigService } from "@/server/common/services/config-service";

const logger = createLogger("server-controller");

export const serverController = new Hono()
    .get("/info", async c => {
        logger.info("Received request to get system information");

        const systemInfoResult = await ServerService.getInfo();

        if (!systemInfoResult.success) {
            logger.error({ message: systemInfoResult.message }, "Failed to get apps");
            return ErrorResponse(c, { message: systemInfoResult.message });
        }

        return SuccessResponse(c, systemInfoResult.data);
    })
    .get("/auth", async c => {
        logger.info("Received request to get basic auth information");

        const serverConfigResult = await ConfigService.getCurrentServerConfig();

        if (!serverConfigResult.success) {
            logger.error({ message: serverConfigResult.message }, "Failed to get apps");
            return ErrorResponse(c, { message: serverConfigResult.message });
        }

        const authInfo = {
            username: serverConfigResult.data.username,
            isActive: Boolean(serverConfigResult.data.hashedPassword),
        };

        return SuccessResponse(c, authInfo);
    });
