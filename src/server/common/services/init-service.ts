import { createLogger } from "@/utils/logger";
import { CaddyService } from "./caddy-service";
import { AppService } from "./app-service";
import { Result } from "@banjoanton/utils";

const logger = createLogger("init-service");

const initApplications = async () => {
    const apps = await AppService.getAll();

    if (!apps.success) {
        logger.error({ message: apps.message }, "Failed to get all applications");
        return Result.error(apps.message);
    }

    if (!apps.data.length) {
        logger.info("No applications found");
        return Result.ok();
    }

    logger.info({ apps: apps.data }, "Found applications");
    for (const app of apps.data) {
        const addConfigResult = await CaddyService.addConfigToPath(app);

        if (!addConfigResult.success) {
            logger.error({ message: addConfigResult.message }, "Failed to add config to path");
            return Result.error(addConfigResult.message);
        }
    }

    logger.info("Added all application");
    return Result.ok();
};

const initServer = async () => {
    logger.info("Initializing server");

    await initApplications();
    logger.debug("INIT: Initialized applications");
    await CaddyService.addActiveConfigsToDefault();
    logger.debug("INIT: Added active configs to default Caddyfile");

    logger.info("Server initialized");
};

export const InitService = { initServer };
