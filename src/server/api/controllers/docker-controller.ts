import { App, AppProxy } from "@/server/common/models/app-model";
import { AppService } from "@/server/common/services/app-service";
import { DirectoryService } from "@/server/common/services/directory-service";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { ErrorResponse, SuccessResponse } from "../controller-model";
import { uuid } from "@banjoanton/utils";
import { createLogger } from "@/utils/logger";

const logger = createLogger("docker-controller");

const dockerStartSchema = z.object({
    path: z.string(),
});

export const dockerController = new Hono()
    .post("/start", zValidator("json", dockerStartSchema), async c => {
        logger.info("Received request to start docker compose");
        const { path } = c.req.valid("json");
        // const result = await DockerShellService.stopCompose({ path });

        const app = App.from({
            name: "test",
            slug: uuid(),
            directory: DirectoryService.getAppPath("test-1"),
            domain: "test.com",
            proxies: [AppProxy.from({ port: 3000 })],
        });

        await AppService.create(app);

        const app2: App = {
            name: "test2",
            slug: uuid(),
            directory: DirectoryService.getAppPath("test-2"),
            domain: "test2.com",
            proxies: [AppProxy.from({ port: 3000, subPath: "/test" })],
        };

        const result = await AppService.create(app2);

        if (!result.success) {
            logger.error({ message: result.message }, "Could not stop docker compose");
            return ErrorResponse(c, { message: result.message });
        }

        logger.info("Docker compose stopped");
        return SuccessResponse(c, { result });
    })
    .get("/test", async c => {
        return c.json({ message: "Hello test" });
    });
