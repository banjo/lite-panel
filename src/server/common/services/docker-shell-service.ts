import { createLogger } from "@/utils/logger";
import { Result } from "@/utils/result";
import { AsyncResultType, isEmpty, last, Maybe, wrapAsync } from "@banjoanton/utils";
import { ShellService } from "./shell-service";
import Dockerode, { ContainerInfo } from "dockerode";
import { AppService } from "./app-service";

const logger = createLogger("docker-shell-service");

const handleComposeResponse = (response: string) => {
    const lines = response.split("\n");

    const warningRegex = /level=(warning)/;
    const errorWarning = /level=(error|fatal)/;
    const messages: string[] = [];

    const warnings = lines.filter(line => warningRegex.test(line));
    if (!isEmpty(warnings)) {
        messages.push(...warnings);
    }

    const errors = lines.filter(line => errorWarning.test(line));
    if (!isEmpty(errors)) {
        messages.push(...errors);
    }

    const finalLine = last(lines);

    if (finalLine && !messages.includes(finalLine)) {
        messages.push(finalLine);
    }

    return {
        message: messages.join("\n"),
        isError: errors.length > 0,
    };
};

const docker = new Dockerode();

const listContainers = async () => {
    const [containers, error] = await wrapAsync(async () => await docker.listContainers());
    console.dir(containers, { depth: null });

    if (error) {
        logger.error({ error }, "Could not get current docker containers");
        return Result.error(error.message);
    }

    const getProjectSlug = (container: ContainerInfo): Maybe<string> =>
        container.Labels?.["com.docker.compose.project"];

    const allAppsResult = await AppService.getAll();

    if (!allAppsResult.success) {
        logger.error({ message: allAppsResult.message }, "Could not get all apps");
        return Result.error(allAppsResult.message);
    }

    const currentSlugs = allAppsResult.data.map(app => app.slug);
    const activeContainers = containers.filter(container => {
        const slug = getProjectSlug(container);
        if (!slug) return false;
        return currentSlugs.includes(slug);
    });

    const mapped = activeContainers.map(container => ({
        slug: getProjectSlug(container),
        ports: container.Ports.map(port => port.PublicPort),
        state: container.State,
        status: container.Status,
        createdAtUnixSeconds: container.Created,
        dockerId: container.Id,
        image: container.Image,
        imageId: container.ImageID,
        service: container.Labels?.["com.docker.compose.service"],
    }));

    return mapped;
};

type DockerShellProps = {
    path: string;
};

type StartComposeResult = { output?: string };
const startCompose = async ({ path }: DockerShellProps): AsyncResultType<StartComposeResult> => {
    const result = await ShellService.exec(`docker compose up -d`, { path });

    if (!result.success) {
        const message = ShellService.parseShellErrorMessage(result.message);
        return Result.error(message);
    }

    const { message, isError } = handleComposeResponse(result.data.response);

    if (isError) {
        logger.error(`Docker compose up error: ${message}`);
        return Result.error(message);
    }

    return Result.ok({ output: message });
};

const stopCompose = async ({ path }: DockerShellProps) => {
    const result = await ShellService.exec(`docker compose down --remove-orphans`, { path });

    if (!result.success) {
        const message = ShellService.parseShellErrorMessage(result.message);
        return Result.error(message);
    }

    const { message, isError } = handleComposeResponse(result.data.response);

    if (isError) {
        logger.error(`Docker compose down error: ${message}`);
        return Result.error(message);
    }

    return Result.ok({ output: message });
};

const restartCompose = async ({ path }: DockerShellProps) => {
    const stopResult = await stopCompose({ path });

    if (!stopResult.success) {
        return stopResult;
    }

    return startCompose({ path });
};

export const DockerShellService = { startCompose, stopCompose, restartCompose, listContainers };
