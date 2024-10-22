import { createLogger } from "@/utils/logger";
import { Result } from "@/utils/result";
import { AsyncResultType, isEmpty, last } from "@banjoanton/utils";
import { ShellService } from "./shell-service";

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

export const DockerShellService = { startCompose, stopCompose, restartCompose };
