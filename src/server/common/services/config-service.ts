import { prisma } from "@/db";
import { createLogger } from "@/utils/logger";
import { Result } from "@/utils/result";
import { attemptAsync, wrapAsync } from "@banjoanton/utils";
import fs from "fs-extra";
import path from "node:path";
import { ServerConfig } from "../models/server-config-model";
import { DirectoryService } from "./directory-service";
import { SecurityService } from "./security-service";

const logger = createLogger("config-service");

type StartupServerConfig = {
    port: string;
    domain: string;
    serviceName: string;
    basicAuth: string;
};

const getServerConfigFromStartup = async () => {
    logger.info("Checking for server config file");
    const directory = DirectoryService.configPath();
    const filePath = path.join(directory, "server-config.json");

    const fileExists = await fs.exists(filePath);

    if (!fileExists) {
        logger.info("No server config file found");
        return undefined;
    }

    const content = await attemptAsync<StartupServerConfig>(
        async () => await fs.readJson(filePath)
    );

    if (!content) {
        logger.error("Could not read server config file");
        return undefined;
    }

    const auth = await SecurityService.hashBasicAuth(content.basicAuth);

    const serverConfig: ServerConfig = {
        domain: content.domain,
        port: Number(content.port),
        serviceName: content.serviceName,
        hashedPassword: auth?.hashedPassword,
        username: auth?.username,
    };

    logger.info("Server config file found");
    return serverConfig;
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
