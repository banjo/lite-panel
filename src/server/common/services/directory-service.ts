import { createLogger } from "@/utils/logger";
import { Result } from "@/utils/result";
import { isProduction } from "@/utils/runtime";
import { wrapAsync } from "@banjoanton/utils";
import { findUpSync } from "find-up";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const logger = createLogger("directory-service");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = findUpSync("package.json", { cwd: __dirname });
if (!packageJsonPath) {
    throw new Error("package.json not found");
}
const packageJsonDir = path.dirname(packageJsonPath);

const DEVELOPMENT_DIRECTORY = path.join(packageJsonDir, ".dev-files");
const PRODUCTION_DIRECTORY = "/srv/.lite-panel";

const DEFAULT_DIRECTORY = isProduction ? PRODUCTION_DIRECTORY : DEVELOPMENT_DIRECTORY;
const APPS_DIRECTORY = path.join(DEFAULT_DIRECTORY, "apps");
const SERVER_DIRECTORY = path.join(DEFAULT_DIRECTORY, "server");

const basePath = () => DEFAULT_DIRECTORY;
const appsPath = () => APPS_DIRECTORY;
const serverPath = () => SERVER_DIRECTORY;
const getAppPath = (appName: string) => path.join(APPS_DIRECTORY, appName);

const createAppDirectory = async (appName: string) => {
    const appPath = path.join(APPS_DIRECTORY, appName);
    const [_, error] = await wrapAsync(async () => {
        return await fs.mkdir(appPath, { recursive: true });
    });

    if (error) {
        logger.error({ error, appName }, "Failed to create app directory");
        return Result.error(error.message);
    }

    return Result.ok(appPath);
};

export const DirectoryService = {
    basePath,
    appsPath,
    serverPath,
    createAppDirectory,
    getAppPath,
};
