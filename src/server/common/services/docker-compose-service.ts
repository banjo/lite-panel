import { createLogger } from "@/utils/logger";
import { App, DockerComposeApp, DockerComposeMeta } from "../models/app-model";
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

const saveComposeFile = async (app: DockerComposeApp) => {
    const [_, error] = await wrapAsync(
        async () =>
            await fs.writeFile(`${app.directory}/docker-compose.yml`, app.meta.composeFileContent)
    );

    if (error) {
        logger.error({ error }, "Failed to save compose file");
        return Result.error(error.message);
    }

    return Result.ok();
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

    const composeFileResult = await saveComposeFile(app);

    if (!composeFileResult.success) {
        logger.error({ message: composeFileResult.message }, "Failed to create compose file");
        return Result.error(composeFileResult.message);
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

const updateApp = async (slug: string, updateProps: Partial<DockerComposeApp>) => {
    logger.debug({ slug }, "Updating app");

    const appResult = await getDockerComposeApp(slug);

    if (!appResult.success) {
        logger.error({ message: appResult.message }, "Failed to get app");
        return Result.error(appResult.message);
    }

    const app = appResult.data;

    const updatedApp = App.update(app, updateProps);

    if (!App.isDockerComposeApp(updatedApp)) {
        logger.error({ name: app.name }, "App is not a docker compose app");
        return Result.error("App is not a docker compose app");
    }

    const updateResult = await AppService.update(updatedApp);

    if (!updateResult.success) {
        logger.error({ message: updateResult.message }, "Failed to update app");
        return Result.error(updateResult.message);
    }

    const composeFileResult = await saveComposeFile(updatedApp);

    if (!composeFileResult.success) {
        logger.error({ message: composeFileResult.message }, "Failed to update compose file");
        return Result.error(composeFileResult.message);
    }

    const restartResult = await DockerShellService.restartCompose({ path: app.directory });

    if (!restartResult.success) {
        logger.error(
            { message: restartResult.message, name: app.name },
            "Failed to restart compose"
        );
        return Result.error(restartResult.message);
    }

    const caddyReloadResult = await CaddyService.reload();

    if (!caddyReloadResult.success) {
        logger.error({ message: caddyReloadResult.message }, "Failed to reload caddy");
        return Result.error(caddyReloadResult.message);
    }

    return Result.ok(updatedApp);
};

const deleteApp = async (slug: string) => {
    logger.debug({ slug }, "Deleting app");

    const appResult = await getDockerComposeApp(slug);

    if (!appResult.success) {
        logger.error({ message: appResult.message }, "Failed to get app");
        return Result.error(appResult.message);
    }

    const app = appResult.data;

    const stopResult = await DockerShellService.stopCompose({ path: app.directory });

    if (!stopResult.success) {
        logger.error({ message: stopResult.message, name: app.name }, "Failed to stop compose");
        return Result.error(stopResult.message);
    }

    const deleteResult = await AppService.deleteApp(app.slug);

    if (!deleteResult.success) {
        logger.error({ message: deleteResult.message }, "Failed to delete app");
        return Result.error(deleteResult.message);
    }

    const caddyReloadResult = await CaddyService.reload();

    if (!caddyReloadResult.success) {
        logger.error({ message: caddyReloadResult.message }, "Failed to reload caddy");
        return Result.error(caddyReloadResult.message);
    }

    return Result.ok();
};

export const DockerComposeService = {
    createApp,
    restartApp,
    getApp: getDockerComposeApp,
    updateApp,
    deleteApp,
};
