import { createLogger } from "@/utils/logger";
import { Result } from "@/utils/result";
import { isProduction } from "@/utils/runtime";
import { wrapAsync } from "@banjoanton/utils";
import { findUpSync } from "find-up";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { App } from "../models/app-model";

const logger = createLogger("directory-service");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDevelopmentDirectory = () => {
    const packageJsonPath = findUpSync("package.json", { cwd: __dirname });
    if (!packageJsonPath) {
        throw new Error("package.json not found");
    }
    const packageJsonDir = path.dirname(packageJsonPath);

    return path.join(packageJsonDir, ".dev-files");
};

const PRODUCTION_DIRECTORY = "/data/lite-panel";

const DEFAULT_DIRECTORY = isProduction ? PRODUCTION_DIRECTORY : getDevelopmentDirectory();
const APPS_DIRECTORY = path.join(DEFAULT_DIRECTORY, "apps");
const CONFIG_DIRECTORY = path.join(DEFAULT_DIRECTORY, "config");
const CADDY_DIRECTORY = path.join(DEFAULT_DIRECTORY, "caddy");
const REPO_DIRECTORY = path.join(DEFAULT_DIRECTORY, "repo");

const basePath = () => DEFAULT_DIRECTORY;
const appsPath = () => APPS_DIRECTORY;
const configPath = () => CONFIG_DIRECTORY;
const repoPath = () => REPO_DIRECTORY;
const caddyPath = () => CADDY_DIRECTORY;
const getAppPath = (slug: string) => path.join(APPS_DIRECTORY, slug);

const createAppDirectory = async (app: App) => {
    const appPath = getAppPath(app.slug);
    const exists = await fs.exists(appPath);

    if (exists) {
        return Result.ok(appPath);
    }

    const [_, error] = await wrapAsync(async () => {
        return await fs.mkdir(appPath, { recursive: true });
    });

    if (error) {
        logger.error({ error, appName: app }, "Failed to create app directory");
        return Result.error(error.message);
    }

    return Result.ok(appPath);
};

const removeAppDirectory = async (slug: string) => {
    const appPath = getAppPath(slug);
    const exists = await fs.exists(appPath);

    if (!exists) {
        return Result.ok();
    }

    const [_, error] = await wrapAsync(async () => {
        return await fs.remove(appPath);
    });

    if (error) {
        logger.error({ error, slug }, "Failed to remove app directory");
        return Result.error(error.message);
    }

    return Result.ok();
};

const buildAssetsPath = () => path.join(REPO_DIRECTORY, "build", "assets");

export const DirectoryService = {
    basePath,
    appsPath,
    configPath,
    repoPath,
    createAppDirectory,
    removeAppDirectory,
    getAppPath,
    caddyPath,
    buildAssetsPath,
};
