import { createLogger } from "@/utils/logger";
import { AsyncResultType, isEmpty, Result } from "@banjoanton/utils";
import { execa, ExecaError } from "execa";

const logger = createLogger("shell-service");

type ExecOptions = {
    path?: string;
};

type ExecResult = {
    message: string;
};

type ExecReturn = AsyncResultType<ExecResult>;

const defaultExecOptions: ExecOptions = {
    path: undefined,
};

const exec = async (command: string, options = defaultExecOptions): ExecReturn => {
    try {
        const { path } = options;
        logger.info({ path, command }, "Executing command");
        const args = command.split(" ");
        const main = args[0];
        const sub = args.slice(1);

        const result = await execa(main, sub, { cwd: path });

        if (!isEmpty(result.stderr)) {
            logger.error({ stderr: result.stderr }, "Command failed");
            return Result.error(result.stderr);
        }

        logger.info({ stdout: result.stdout }, "Command executed");
        return Result.ok({ message: result.stdout });
    } catch (error) {
        logger.error({ error }, "Command failed");
        if (error instanceof ExecaError) {
            return Result.error(error.message);
        } else if (error instanceof Error) {
            return Result.error(error.message);
        }

        return Result.error("Unknown error");
    }
};

export const ShellService = { exec };
