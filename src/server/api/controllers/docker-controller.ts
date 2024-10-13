import { DockerShellService } from "@/server/common/services/docker-shell-service";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { ErrorResponse, SuccessResponse } from "../controller-model";
import { CaddyService } from "@/server/common/services/caddy-service";
import { DirectoryService } from "@/server/common/services/directory-service";
import { App } from "@/server/common/models/app-model";

const dockerStartSchema = z.object({
    path: z.string(),
});

export const dockerController = new Hono()
    .post("/start", zValidator("json", dockerStartSchema), async c => {
        const { path } = c.req.valid("json");
        // const result = await DockerShellService.stopCompose({ path });

        const app: App = {
            name: "test",
            directory: DirectoryService.getAppPath("test"),
            domain: "test.com",
            port: 3000,
        };

        const app2: App = {
            name: "test2",
            directory: DirectoryService.getAppPath("test2"),
            domain: "test2.com",
            port: 3001,
        };
        const directory = await DirectoryService.createAppDirectory(app);
        const config = await CaddyService.addConfigToPath(app);

        const directory2 = await DirectoryService.createAppDirectory(app2);
        const config2 = await CaddyService.addConfigToPath(app2);
        const result = await CaddyService.addActiveConfigsToDefault();

        if (!result.success) {
            return ErrorResponse(c, { message: result.message });
        }

        return SuccessResponse(c, { result });
    })
    .get("/test", async c => {
        return c.json({ message: "Hello test" });
    });
