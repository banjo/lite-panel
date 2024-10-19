import { createLogger } from "@/utils/logger";
import { attemptAsync, wrapAsync } from "@banjoanton/utils";
import fs from "fs-extra";
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

    const fileExists = await fs.exists(filePath);

    if (!fileExists) {
        logger.info("No server config file found");
        return undefined;
    }

    const content = await attemptAsync<ServerConfig>(async () => {
        const res = await fs.readJson(filePath);
        return {
            port: Number(res.port),
            domain: res.domain,
            serviceName: res.serviceName,
            basicAuth: res.basicAuth,
        };
    });

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
