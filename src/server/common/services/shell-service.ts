import { createLogger } from "@/utils/logger";
import { Result } from "@/utils/result";
import { AsyncResultType, attempt, isDefined, isEmpty, last } from "@banjoanton/utils";
import { execa, ExecaError } from "execa";

const logger = createLogger("shell-service");

type ExecOptions = {
    path?: string;
    sudo?: boolean;
};

type ExecResult = {
    response: string;
    isError: boolean;
};

type ExecReturn = AsyncResultType<ExecResult>;

const defaultExecOptions: ExecOptions = {
    path: undefined,
    sudo: false,
};

const exec = async (command: string, options = defaultExecOptions): ExecReturn => {
    try {
        const { path, sudo } = options;
        logger.debug({ path, command, sudo }, "Executing command");
        const fullCommand = sudo ? `sudo ${command}` : command;
        const args = fullCommand.split(" ");
        const main = args[0];
        const sub = args.slice(1);

        const result = await execa(main, sub, { cwd: path });

        const responseArray = result.stdio.filter(l => isDefined(l)).filter(l => !isEmpty(l));
        const isError = result.failed || !isEmpty(result.stderr);
        const response = responseArray.at(0)!;

        logger.debug({ response, isError }, "Command executed");
        return Result.ok({ response, isError });
    } catch (error: any) {
        logger.error(
            { command, message: error?.message ?? "Something went wrong" },
            "Command failed"
        );
        if (error instanceof ExecaError) {
            return Result.error(error.message.trim());
        } else if (error instanceof Error) {
            return Result.error(error.message.trim());
        }

        return Result.error("Unknown error");
    }
};

const parseShellErrorMessage = (message: string) =>
    attempt(
        () => {
            const splitted = message.split("\n");
            const lastLine = last(splitted);

            if (lastLine) {
                return lastLine;
            }

            return message;
        },
        { fallbackValue: message }
    );

export const ShellService = { exec, parseShellErrorMessage };
