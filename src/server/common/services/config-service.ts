import { createLogger } from "@/utils/logger";
import { attemptAsync, wrapAsync } from "@banjoanton/utils";
import { exists, readJson } from "fs-extra";
import path from "node:path";
import { ServerConfig } from "../models/server-config-model";
import { DirectoryService } from "./directory-service";
import { prisma } from "@/db";
import { Result } from "@/utils/result";

const logger = createLogger("config-service");

const getServerConfigFromStartup = async () => {
    logger.info("Checking for server config file");
    const directory = DirectoryService.configPath();
    const filePath = path.join(directory, "server-config.json");

    const fileExists = await exists(filePath);

    if (!fileExists) {
        logger.info("No server config file found");
        return undefined;
    }

    const content = await attemptAsync<ServerConfig>(async () => await readJson(filePath, "utf8"));

    if (!content) {
        logger.error("Could not read server config file");
        return undefined;
    }

    logger.info("Basic auth file found");
    return content;
};

const getCurrentServerConfig = async () => {
    const [config, error] = await wrapAsync(async () => await prisma.config.findFirst());

    if (error) {
        logger.error({ error }, "Failed to get server config");
        return Result.error(error.message);
    }

    if (!config) {
        logger.error("No server config found");
        return Result.error("No server config found");
    }

    return Result.ok(config);
};

export const ConfigService = { getServerConfigFromStartup, getCurrentServerConfig };
