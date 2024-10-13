import { createLogger } from "@/utils/logger";
import { isProduction } from "@/utils/runtime";
import { Result, wrapAsync } from "@banjoanton/utils";
import fs from "fs/promises";
import { globby } from "globby";
import { DEVELOPMENT_DIRECTORY, DirectoryService } from "./directory-service";
import { ShellService } from "./shell-service";
import { CaddyTextService } from "./caddy-text-service";
import { App } from "../models/app-model";
import path from "path";

const logger = createLogger("caddy-service");
const DEFAULT_CADDYFILE = isProduction
    ? "/etc/caddy/Caddyfile"
    : `${DEVELOPMENT_DIRECTORY}/Caddyfile`;
const CADDY_FILES_GLOB = `${DirectoryService.appsPath()}/*/Caddyfile`;

// All content in the main caddy file should be between these two comments, and will be replaced on updates
const CADDY_COMMENT_HEADER = CaddyTextService.createCaddyComment("lite-panel start");
const CADDY_COMMENT_FOOTER = CaddyTextService.createCaddyComment("lite-panel end");

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

const restart = async () => await ShellService.exec(`systemctl reload caddy`);
const start = async () => await ShellService.exec(`systemctl start caddy`);
const stop = async () => await ShellService.exec(`systemctl stop caddy`);

const readConfig = async (path: string) => {
    const [data, error] = await wrapAsync(async () => await fs.readFile(path, "utf-8"));

    if (error) {
        logger.error({ error }, "Failed to read Caddyfile");
        return Result.error(error.message);
    }

    return Result.ok(data);
};

const readDefaultConfig = async () => await readConfig(DEFAULT_CADDYFILE);

const readAppConfig = async (app: App) => {
    const caddyPath = path.join(app.directory, "Caddyfile");
    return await readConfig(caddyPath);
};

const getActiveConfigs = async () => await globby(CADDY_FILES_GLOB, { onlyFiles: true });

const updateAppConfig = async (app: App, config: string) => {
    const caddyPath = path.join(app.directory, "Caddyfile");
    const [_, error] = await wrapAsync(async () => await fs.writeFile(caddyPath, config));

    if (error) {
        logger.error({ error }, "Failed to update Caddyfile");
        return Result.error(error.message);
    }

    return Result.ok();
};

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
        async () => await fs.writeFile(DEFAULT_CADDYFILE, updatedDefaultCaddyfileResult.data)
    );

    if (error) {
        logger.error({ error }, "Failed to update Caddyfile");
        return Result.error(error.message);
    }

    logger.info({ data: updatedDefaultCaddyfileResult.data }, "Updated default Caddyfile");
    return Result.ok();
};

const addActiveConfigsToDefault = async () => {
    const activeConfigs = await getActiveConfigs();

    if (!activeConfigs.length) {
        return Result.ok();
    }

    const newConfig = activeConfigs.map(path => `import ${path}`).join("\n");
    const commentedConfig = CaddyTextService.createCaddyCommentedConfig(newConfig);

    return await updateDefaultConfig(commentedConfig);
};

const addConfigToPath = async (app: App) => {
    const config = CaddyTextService.createAppConfig(app);
    return await updateAppConfig(app, config);
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

export const CaddyService = {
    restart,
    start,
    stop,
    readDefaultConfig,
    validateFile,
    readAppConfig,
    getActiveConfigs,
    updateDefaultConfig,
    addActiveConfigsToDefault,
    addConfigToPath,
};
