import { createLogger } from "@/utils/logger";
import { CaddyService } from "./caddy-service";
import { AppService } from "./app-service";
import { Result } from "@banjoanton/utils";
import { DirectoryService } from "./directory-service";

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

    logger.debug({ apps: apps.data.map(a => a.slug) }, "Found applications");
    for (const app of apps.data) {
        const addConfigResult = await CaddyService.addConfigToPath(app);

        if (!addConfigResult.success) {
            logger.error({ message: addConfigResult.message }, "Failed to add config to path");
            return Result.error(addConfigResult.message);
        }
    }

    const slugs = apps.data.map(app => app.slug);
    logger.info({ slugs }, "Added all application from database");

    const activeConfigPaths = await CaddyService.getActiveConfigs();
    const overflowConfigs = activeConfigPaths.filter(
        path => !apps.data.find(app => path.includes(app.slug))
    );

    if (overflowConfigs.length) {
        const overflowSlugs = overflowConfigs.map(path => path.split("/").slice(-2)[0]);
        logger.error({ slugs: overflowSlugs }, "Found overflow configs");
        for (const slug of overflowSlugs) {
            const removeConfigResult = await DirectoryService.removeAppDirectory(slug);

            if (!removeConfigResult.success) {
                logger.error({ message: removeConfigResult.message }, "Failed to remove config");
                return Result.error(removeConfigResult.message);
            }
        }

        logger.info({ slugs: overflowSlugs }, "Removed overflow configs");
    }

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
