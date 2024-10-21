import { ServerService } from "@/server/common/services/server-service";
import { createLogger } from "@/utils/logger";
import { Hono } from "hono";
import { ErrorResponse, SuccessResponse } from "../controller-model";
import { ConfigService } from "@/server/common/services/config-service";
import { zValidator } from "@hono/zod-validator";
import { AuthLoginSchema } from "@/models/auth-login-model";
import { SecurityService } from "@/server/common/services/security-service";

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
            username: serverConfigResult.data.username ?? undefined,
            isActive: Boolean(serverConfigResult.data.hashedPassword),
        };

        return SuccessResponse(c, authInfo);
    })
    .post("/auth", zValidator("json", AuthLoginSchema), async c => {
        logger.info("Received request to update basic auth information");

        const authLogin = c.req.valid("json");

        const updateResult = await SecurityService.updateAuthLogin(authLogin);

        if (!updateResult.success) {
            logger.error({ message: updateResult.message }, "Failed to update auth info");
            return ErrorResponse(c, { message: updateResult.message });
        }

        return SuccessResponse(c, { message: "Successfully updated auth information" });
    });
