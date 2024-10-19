import { attempt } from "@banjoanton/utils";
import { App, AppProxy } from "../models/app-model";
import { SecurityService } from "./security-service";

const createReverseProxy = ({ port, subPath }: AppProxy) =>
    `reverse_proxy ${subPath ?? ""} localhost:${port}`;

const createAppConfig = ({ domain, proxies }: App) =>
    `${domain} {
    ${proxies.map(createReverseProxy).join("\n")}
    encode gzip zstd
}`;

type ServerConfigProps = {
    domain: string;
    port: number;
    assetDirectory: string;
    /**
     * Basic auth in the format of "username:password"
     */
    basicAuth?: string;
};
const createServerConfig = ({ assetDirectory, port, domain, basicAuth }: ServerConfigProps) => {
    const basicAuthConfig = attempt(
        () => {
            if (!basicAuth) return "";
            const [username, password] = basicAuth.split(":") ?? [];
            const hashedPassword = password ? SecurityService.hashPassword(password) : undefined;

            if (!username || !hashedPassword) {
                return "";
            }

            return `basic_auth {\n${username} ${hashedPassword}\n}`;
        },
        { fallbackValue: "" }
    );

    return `${domain} {
    handle_path /assets/* {
        root * ${assetDirectory}
        file_server
    }

    ${basicAuthConfig}

    reverse_proxy localhost:${port}
    encode gzip
}`;
};

const createCaddyComment = (comment: string) => `# ${comment}`;

const createCaddyCommentHeader = createCaddyComment("lite-panel start");
const createCaddyCommentFooter = createCaddyComment("lite-panel end");

const createCaddyCommentedConfig = (config: string) => `${createCaddyCommentHeader}
${config}
${createCaddyCommentFooter}`;

export const CaddyTextService = {
    createAppConfig,
    createCaddyCommentedConfig,
    createCaddyComment,
    createServerConfig,
};
