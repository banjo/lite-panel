import { attemptAsync, isEmpty, Maybe } from "@banjoanton/utils";
import { hash } from "bcrypt";

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

export const SecurityService = { hashPassword, hashBasicAuth };
