import { prisma } from "@/db";
import { AuthLogin } from "@/models/auth-login-model";
import { createLogger } from "@/utils/logger";
import { Result } from "@/utils/result";
import { attemptAsync, isEmpty, Maybe, wrapAsync } from "@banjoanton/utils";
import { hash } from "bcrypt";
import { CaddyService } from "./caddy-service";

const logger = createLogger("security-service");

const hashPassword = (password: string) => hash(password, 10);

const hashBasicAuth = async (str: Maybe<string>) =>
    await attemptAsync(async () => {
        if (!str) return undefined;

        const splitted = str.split(":") ?? [];
        if (isEmpty(splitted)) return undefined;
        const [username, password] = splitted;
        if (isEmpty(username) || isEmpty(password)) return undefined;

        const hashedPassword = await hashPassword(password);
        return {
            username,
            hashedPassword,
        };
    });

const updateAuthLogin = async (authLogin: AuthLogin) => {
    const { username, password } = authLogin;
    const hashedPassword = await hashPassword(password);

    const [_, error] = await wrapAsync(
        async () =>
            await prisma.config.update({
                // TODO: better way to get the only config
                where: { id: 1 },
                data: {
                    username,
                    hashedPassword,
                },
            })
    );

    if (error) {
        logger.error({ error }, "Failed to update auth info");
        return Result.error(error.message);
    }

    const updateResult = await CaddyService.updateBasicAuth(username, hashedPassword);

    if (!updateResult.success) {
        logger.error({ message: updateResult.message }, "Failed to update auth info");
        return Result.error(updateResult.message);
    }

    return Result.ok();
};

export const SecurityService = { hashPassword, hashBasicAuth, updateAuthLogin };
