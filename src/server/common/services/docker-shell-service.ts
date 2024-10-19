import { createLogger } from "@/utils/logger";
import { AsyncResultType, attempt, first } from "@banjoanton/utils";
import { ShellService } from "./shell-service";
import { Result } from "@/utils/result";

const logger = createLogger("docker-shell-service");

type DockerShellProps = {
    path: string;
};

const parseErrorMessage = (message: string) =>
    attempt(() => message.split("docker-compose.yml:")[1], { fallbackValue: message });

type StartComposeResult = { output?: string };
const startCompose = async ({ path }: DockerShellProps): AsyncResultType<StartComposeResult> => {
    const result = await ShellService.exec(`docker compose up -d`, { path });

    if (!result.success) {
        const message = parseErrorMessage(result.message.trim());
        return Result.error(message);
    }

    const firstLine = first(result.data.response.split("\n"));
    if (firstLine?.includes("level=warning")) {
        logger.warn(`Docker compose up warning: ${firstLine}`);
        return Result.ok({ output: firstLine });
    }

    if (firstLine?.includes("level=error")) {
        logger.error(`Docker compose up error: ${firstLine}`);
        return Result.error(firstLine);
    }

    if (firstLine?.includes("level=fatal")) {
        logger.error(`Docker compose up fatal: ${firstLine}`);
        return Result.error(firstLine);
    }

    return Result.ok({ output: undefined });
};

const stopCompose = async ({ path }: DockerShellProps) =>
    ShellService.exec(`docker compose down --remove-orphans`, { path });

export const DockerShellService = { startCompose, stopCompose };
