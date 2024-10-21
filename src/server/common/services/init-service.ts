import { prisma } from "@/db";
import { createLogger } from "@/utils/logger";
import { Result, wrapAsync } from "@banjoanton/utils";
import { ServerConfig } from "../models/server-config-model";
import { AppService } from "./app-service";
import { CaddyService } from "./caddy-service";
import { ConfigService } from "./config-service";
import { DirectoryService } from "./directory-service";

const logger = createLogger("init-service");

const initConfig = async () => {
    logger.info("Initializing server config");

    const [count, error] = await wrapAsync(async () => await prisma.config.count());

    if (error) {
        logger.error({ error }, "Failed to check config count");
        return Result.error(error.message);
    }

    if (count > 1) {
        logger.error("Multiple configs found, only one is allowed");
        return Result.error("Multiple configs found");
    }

    const [config, serverError] = await wrapAsync(async () => await prisma.config.findFirst());

    if (serverError) {
        logger.error({ serverError }, "Failed to get config");
        return Result.error(serverError.message);
    }

    if (config) {
        return Result.ok();
    }

    logger.info("No configuration found in the database, creating one");
    const serverConfig = await ConfigService.getServerConfigFromStartup();

    if (!serverConfig) {
        logger.error("No server config found");
        return Result.error("No server config found");
    }

    const [_, createError] = await wrapAsync(async () => {
        return await prisma.config.create({
            data: {
                port: serverConfig.port,
                domain: serverConfig.domain,
                username: serverConfig.username,
                hashedPassword: serverConfig.hashedPassword,
                serviceName: serverConfig.serviceName,
            },
        });
    });

    if (createError) {
        logger.error({ createError }, "Failed to create config");
        return Result.error(createError.message);
    }

    return Result.ok();
};

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

    logger.debug({ apps: apps.data.map(a => a.name) }, "Found applications");
    for (const app of apps.data) {
        const addConfigResult = await CaddyService.addConfigToPath(app);

        if (!addConfigResult.success) {
            logger.error({ message: addConfigResult.message }, "Failed to add config to path");
            return Result.error(addConfigResult.message);
        }
    }

    const names = apps.data.map(app => app.name);
    logger.info({ names }, "Added all application from database");

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

/**
 *  Replace the server caddy file, use server config to creata a new one
 */
const initCaddy = async () => {
    const serverConfig = await ConfigService.getCurrentServerConfig();

    if (!serverConfig.success) {
        logger.error({ message: serverConfig.message }, "Failed to get server config");
        return Result.error(serverConfig.message);
    }

    const serverConfigData = serverConfig.data;

    const config = ServerConfig.fromDb(serverConfigData);
    const updateResult = await CaddyService.updateServerConfig(config);

    if (!updateResult.success) {
        logger.error({ message: updateResult.message }, "Failed to update server config");
        return Result.error(updateResult.message);
    }

    return Result.ok();
};

const initServer = async () => {
    logger.info("Initializing server");

    const configResult = await initConfig();

    if (!configResult.success) {
        logger.error({ message: configResult.message }, "Failed to initialize config");
        return Result.error(configResult.message);
    }
    logger.debug("INIT: Initialized server config");

    await initCaddy();
    logger.debug("INIT: Initialized Caddy server config");
    await initApplications();
    logger.debug("INIT: Initialized applications");
    await CaddyService.addAppConfigsToDefault();
    logger.debug("INIT: Added active configs to default Caddyfile");
    await CaddyService.reload();

    logger.info("Server initialized");
};

export const InitService = { initServer };
