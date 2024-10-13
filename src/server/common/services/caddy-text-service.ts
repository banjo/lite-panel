import { App, AppProxy } from "../models/app-model";

const createReverseProxy = ({ port, subPath }: AppProxy) =>
    `reverse_proxy ${subPath ?? ""} localhost:${port}`;

const createAppConfig = ({ domain, proxies }: App) =>
    `${domain} {
    ${proxies.map(createReverseProxy).join("\n")}
    encode gzip zstd
}`;

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
};
