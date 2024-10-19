import { createLogger } from "@/utils/logger";
import { App, DockerComposeMeta } from "../models/app-model";
import { AppService, CreateAppProps } from "./app-service";
import { Result } from "@/utils/result";
import { DockerShellService } from "./docker-shell-service";
import { CaddyService } from "./caddy-service";
import fs from "fs-extra";
import { wrapAsync } from "@banjoanton/utils";

const logger = createLogger("docker-compose-service");

type CreateDockerComposeAppProps = CreateAppProps & {
    type: "DOCKER_COMPOSE";
    meta: DockerComposeMeta;
};

const getDockerComposeApp = async (slug: string) => {
    const appResult = await AppService.getBySlug(slug);

    if (!appResult.success) {
        logger.error({ message: appResult.message }, "Failed to get app");
        return Result.error(appResult.message);
    }

    const app = appResult.data;

    if (!App.isDockerComposeApp(app)) {
        logger.error({ name: app.name }, "App is not a docker compose app");
        return Result.error("App is not a docker compose app");
    }

    return Result.ok(app);
};

const createApp = async (createAppProps: CreateDockerComposeAppProps) => {
    logger.debug("Creating docker compose app");
    const appResult = await AppService.create(createAppProps);

    if (!appResult.success) {
        logger.error({ message: appResult.message }, "Failed to create app");
        return Result.error(appResult.message);
    }

    const app = appResult.data;

    if (!App.isDockerComposeApp(app)) {
        logger.error({ name: app.name }, "App is not a docker compose app");
        return Result.error("App is not a docker compose app");
    }

    const [_, error] = await wrapAsync(
        async () =>
            await fs.writeFile(`${app.directory}/docker-compose.yml`, app.meta.composeFileContent)
    );

    if (error) {
        logger.error({ error }, "Failed to create compose file");
        return Result.error(error.message);
    }

    const startResult = await DockerShellService.startCompose({ path: app.directory });

    if (!startResult.success) {
        logger.error({ message: startResult.message, name: app.name }, "Failed to start compose");
        return Result.error(startResult.message);
    }

    const caddyReloadResult = await CaddyService.reload();

    if (!caddyReloadResult.success) {
        logger.error({ message: caddyReloadResult.message }, "Failed to reload caddy");
        return Result.error(caddyReloadResult.message);
    }

    return Result.ok(startResult.data);
};

const restartApp = async (slug: string) => {
    logger.debug({ slug }, "Restarting app");

    const appResult = await getDockerComposeApp(slug);

    if (!appResult.success) {
        logger.error({ message: appResult.message }, "Failed to get app");
        return Result.error(appResult.message);
    }

    const app = appResult.data;

    const restartResult = await DockerShellService.restartCompose({ path: app.directory });

    if (!restartResult.success) {
        logger.error(
            { message: restartResult.message, name: app.name },
            "Failed to restart compose"
        );
        return Result.error(restartResult.message);
    }

    return Result.ok(restartResult.data);
};

export const DockerComposeService = { createApp, restartApp, getApp: getDockerComposeApp };
