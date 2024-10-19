import { Config } from "@prisma/client";

export type ServerConfig = {
    domain: string;
    port: number;
    serviceName: string;
    username?: string;
    hashedPassword?: string;
};

export const ServerConfig = {
    from: (config: ServerConfig): ServerConfig => config,
    fromDb: (config: Config): ServerConfig => ({
        domain: config.domain,
        port: config.port,
        serviceName: config.serviceName,
        username: config.username ?? undefined,
        hashedPassword: config.hashedPassword ?? undefined,
    }),
};
