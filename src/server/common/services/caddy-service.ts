import { Result, wrapAsync } from "@banjoanton/utils";
import { ShellService } from "./shell-service";
import fs from "fs/promises";
import { createLogger } from "@/utils/logger";

const logger = createLogger("caddy-service");

const restart = async () => await ShellService.exec(`systemctl reload caddy`);
const start = async () => await ShellService.exec(`systemctl start caddy`);
const stop = async () => await ShellService.exec(`systemctl stop caddy`);

const readConfig = async () => {
    const [data, error] = await wrapAsync(
        async () => await fs.readFile("/etc/caddy/Caddyfile", "utf-8")
    );

    if (error) {
        logger.error({ error }, "Failed to read Caddyfile");
        return Result.error(error.message);
    }

    return Result.ok(data);
};

type AppConfig = {
    domain: string;
    port: number;
};

const createAppConfig = ({ domain, port }: AppConfig) =>
    `${domain} {
    reverse_proxy localhost:${port}
    encode gzip zstd
}`;

export const CaddyService = { restart, start, stop, readConfig, createAppConfig };
