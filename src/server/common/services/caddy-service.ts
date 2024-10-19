import { createLogger } from "@/utils/logger";
import { isProduction } from "@/utils/runtime";
import { attemptAsync, isDefined, isEmpty, Result, wrapAsync } from "@banjoanton/utils";
import fs from "fs-extra";
import { globby } from "globby";
import path from "path";
import { App } from "../models/app-model";
import { CaddyTextService } from "./caddy-text-service";
import { DirectoryService, getDevelopmentDirectory } from "./directory-service";
import { ShellService } from "./shell-service";
import { ServerConfig } from "../models/server-config-model";
import { SecurityService } from "./security-service";

const logger = createLogger("caddy-service");
const DEFAULT_CADDYFILE = isProduction
    ? "/etc/caddy/Caddyfile"
    : `${getDevelopmentDirectory()}/Caddyfile`;

const SERVER_CADDYFILE = path.join(DirectoryService.caddyPath(), "Caddyfile");
const CADDY_FILES_GLOB = `${DirectoryService.appsPath()}/*/Caddyfile`;

// All content in the main caddy file should be between these two comments, and will be replaced on updates
const CADDY_COMMENT_HEADER = CaddyTextService.createCaddyComment("lite-panel start");
const CADDY_COMMENT_FOOTER = CaddyTextService.createCaddyComment("lite-panel end");

// UTILS
const findCaddyCommentedConfig = (config: string) => {
    const headerIndex = config.indexOf(CADDY_COMMENT_HEADER);
    const footerIndex = config.indexOf(CADDY_COMMENT_FOOTER);

    if (headerIndex === -1 || footerIndex === -1) {
        return Result.error("Could not find Caddyfile comments");
    }

    const content = config.slice(headerIndex, footerIndex + CADDY_COMMENT_FOOTER.length);
    return Result.ok(content);
};

const getUpdatedDefaultCaddyfile = (currentFullFile: string, newCommentedConfig: string) => {
    const currentConfigResult = findCaddyCommentedConfig(currentFullFile);

    if (!currentConfigResult.success) {
        return Result.error(currentConfigResult.message);
    }

    const currentConfig = currentConfigResult.data;
    const updatedConfig = currentFullFile.replace(currentConfig, newCommentedConfig);

    return Result.ok(updatedConfig);
};

const readConfig = async (path: string) => {
    const [data, error] = await wrapAsync(async () => await fs.readFile(path, "utf-8"));

    if (error) {
        logger.error({ error }, "Failed to read Caddyfile");
        return Result.error(error.message);
    }

    return Result.ok(data);
};

const validateFile = async (path: string) => {
    const [_, error] = await wrapAsync(async () => await fs.access(path, fs.constants.F_OK));

    if (error) {
        logger.error({ error, path }, "Could not access file");
        return Result.error(error.message);
    }

    const [__, commandError] = await wrapAsync(async () =>
        ShellService.exec(`caddy validate --config ${path}`)
    );

    if (commandError) {
        logger.error({ commandError, path }, "Failed to validate Caddyfile");
        return Result.error(commandError.message);
    }

    return Result.ok();
};

// SERVICE
const reload = async () => await ShellService.exec(`systemctl reload caddy`);
const start = async () => await ShellService.exec(`systemctl start caddy`);
const stop = async () => await ShellService.exec(`systemctl stop caddy`);

// DEFAULT CONFIG
const readDefaultConfig = async () => await readConfig(DEFAULT_CADDYFILE);

const updateDefaultConfig = async (newCommentedConfig: string) => {
    const currentFullFileResult = await readDefaultConfig();

    if (!currentFullFileResult.success) {
        logger.error(
            { message: currentFullFileResult.message },
            "Failed to read default Caddyfile"
        );
        return Result.error(currentFullFileResult.message);
    }

    const updatedDefaultCaddyfileResult = getUpdatedDefaultCaddyfile(
        currentFullFileResult.data,
        newCommentedConfig
    );

    if (!updatedDefaultCaddyfileResult.success) {
        logger.error(
            { message: updatedDefaultCaddyfileResult.message },
            "Failed to update default Caddyfile"
        );
        return Result.error(updatedDefaultCaddyfileResult.message);
    }

    const [_, error] = await wrapAsync(
        async () => await fs.outputFile(DEFAULT_CADDYFILE, updatedDefaultCaddyfileResult.data)
    );

    if (error) {
        logger.error({ error }, "Failed to update Caddyfile");
        return Result.error(error.message);
    }

    logger.debug({ data: updatedDefaultCaddyfileResult.data }, "Updated default Caddyfile");
    return Result.ok();
};

// SERVER CONFIG
const readServerConfig = async () => await readConfig(SERVER_CADDYFILE);

const updateServerConfig = async (serverConfig: ServerConfig) => {
    const assetDirectory = DirectoryService.buildAssetsPath();

    const basicAuth =
        isDefined(serverConfig.username) && isDefined(serverConfig.hashedPassword)
            ? { username: serverConfig.username, hashedPassword: serverConfig.hashedPassword }
            : undefined;

    const content = CaddyTextService.createServerConfig({
        domain: serverConfig.domain,
        port: serverConfig.port,
        assetDirectory,
        basicAuth,
    });

    const [_, error] = await wrapAsync(async () => await fs.outputFile(SERVER_CADDYFILE, content));

    if (error) {
        logger.error({ error }, "Failed to update server Caddyfile");
        return Result.error(error.message);
    }

    return Result.ok();
};

// APP CONFIGS
const readAppConfig = async (app: App) => {
    const caddyPath = path.join(app.directory, "Caddyfile");
    return await readConfig(caddyPath);
};

const getActiveConfigs = async () => await globby(CADDY_FILES_GLOB, { onlyFiles: true });

const addAppConfigsToDefault = async () => {
    const activeConfigs = await getActiveConfigs();

    if (!activeConfigs.length) {
        return Result.ok();
    }

    const newConfig = activeConfigs.map(path => `import ${path}`).join("\n");
    const commentedConfig = CaddyTextService.createCaddyCommentedConfig(newConfig);

    return await updateDefaultConfig(commentedConfig);
};

const updateAppConfig = async (app: App, config: string) => {
    const caddyPath = path.join(app.directory, "Caddyfile");
    const [_, error] = await wrapAsync(async () => await fs.outputFile(caddyPath, config));

    if (error) {
        logger.error({ error }, "Failed to update Caddyfile");
        return Result.error(error.message);
    }

    return Result.ok();
};

const addConfigToPath = async (app: App) => {
    const config = CaddyTextService.createAppConfig(app);
    return await updateAppConfig(app, config);
};

export const CaddyService = {
    reload,
    start,
    stop,
    readDefaultConfig,
    validateFile,
    readAppConfig,
    getActiveConfigs,
    updateDefaultConfig,
    addAppConfigsToDefault,
    addConfigToPath,
    readServerConfig,
    updateServerConfig,
};
