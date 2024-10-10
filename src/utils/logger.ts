import { isBrowser } from "@banjoanton/utils";
import pino, { TransportTargetOptions } from "pino";
import { Env } from "./env";
// * Pino import needs to be default to work in the browser

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharedTransport: any;

export const createLogger = (name: string) => {
    if (isBrowser()) {
        const clientVariables = Env.client();
        return pino({ name, level: clientVariables.VITE_LOG_LEVEL || "info" });
    }

    const targets: TransportTargetOptions[] = [
        {
            target: "pino-pretty",
            options: {
                colorize: true,
                ignore: "hostname,pid",
            },
            level: "trace",
        },
    ];

    if (!sharedTransport) {
        sharedTransport = pino.transport({
            targets,
        });
    }

    const env = Env.server();

    const base = {
        env: env.NODE_ENV,
    };

    return pino(
        {
            name,
            level: env.LOG_LEVEL ?? "info",
            base,
            errorKey: "error",
        },
        sharedTransport
    );
};
