import { Config } from "@prisma/client";

export type ServerConfig = {
    domain: string;
    port: number;
    serviceName: string;
    basicAuth: string;
};

export const ServerConfig = {
    from: (config: ServerConfig) => config,
    fromDb: (config: Config) => ({
        domain: config.domain,
        port: config.port,
        serviceName: config.serviceName,
        basicAuth: config.basicAuth ?? "",
    }),
};
