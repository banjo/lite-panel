import { serve } from "@hono/node-server";
import { app } from "./server/app";
import { Env } from "./utils/env";
import { isProduction } from "./utils/runtime";
import { InitService } from "./server/common/services/init-service";
import { createLogger } from "./utils/logger";

const env = Env.server();
export const port = env.PORT;
const logger = createLogger("index");

const main = async () => {
    await InitService.initServer();

    logger.info(
        `🚀 Server is running on ${isProduction ? "production" : "development"} on http://localhost:${port}`
    );
    serve({
        fetch: app.fetch,
        port,
    });
};

main().catch(console.error);
