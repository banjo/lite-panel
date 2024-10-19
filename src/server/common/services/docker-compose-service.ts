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

export const DockerComposeService = { createApp };
