import { serve } from "@hono/node-server";
import { app } from "./server/app";
import { Env } from "./utils/env";
import { isProduction } from "./utils/runtime";
import { InitService } from "./server/common/services/init-service";
import { createLogger } from "./utils/logger";
import closeWithGrace from "close-with-grace";
import { prisma } from "./db";

const env = Env.server();
export const port = env.PORT;
const logger = createLogger("index");

const main = async () => {
    await InitService.initServer();

    logger.info(
        `🚀 Server is running in ${isProduction ? "production" : "development"} on http://localhost:${port}`
    );
    serve({
        fetch: app.fetch,
        port,
    });
};

closeWithGrace({ delay: 500 }, async ({ err }) => {
    logger.error({ error: err }, "☹️  Server is closing due to an error");
    await prisma.$disconnect();
});

main();
