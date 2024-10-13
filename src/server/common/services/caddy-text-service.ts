import { App } from "../models/app-model";

const createAppConfig = ({ domain, port }: App) =>
    `${domain} {
    reverse_proxy localhost:${port}
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
