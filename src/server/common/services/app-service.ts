import { createLogger } from "@/utils/logger";
import { Result } from "@banjoanton/utils";
import { App } from "../models/app-model";
import { CaddyService } from "./caddy-service";
import { DirectoryService } from "./directory-service";

const logger = createLogger("app-service");

const create = async (app: App) => {
    const appPath = await DirectoryService.createAppDirectory(app);

    if (!appPath.success) {
        logger.error({ message: appPath.message }, "Failed to create app directory");
        return Result.error(appPath.message);
    }

    const addConfigResult = await CaddyService.addConfigToPath(app);

    if (!addConfigResult.success) {
        logger.error({ message: addConfigResult.message }, "Failed to add config to path");
        return Result.error(addConfigResult.message);
    }

    const updateDefaultResult = await CaddyService.addActiveConfigsToDefault();

    if (!updateDefaultResult.success) {
        logger.error({ message: updateDefaultResult.message }, "Failed to update default configs");
        return Result.error(updateDefaultResult.message);
    }

    return Result.ok();
};

export const AppService = { create };
