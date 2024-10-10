import { isBrowser } from "@banjoanton/utils";
import { z } from "zod";

const fromZodError = (error: z.ZodError): string => {
  const message = ["Invalid environment variables:"];

  const affected = error.issues.map((issue) => issue.path.join(".")).join(", ");
  message.push(affected);

  return message.join(" ");
};

const allClient = () => {
  if (!isBrowser()) {
    throw new Error("Client env is only available in the browser");
  }
  // @ts-ignore - Vite injects the env
  return import.meta.env as Record<string, string>;
};

const allServer = () => {
  if (isBrowser()) {
    throw new Error("Server env is only available in Node");
  }
  return process.env;
};

const ServerEnvSchema = z.object({
  PORT: z.coerce.number().min(1000),
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .default("development"),
});

const server = () => {
  if (isBrowser()) {
    throw new Error("Server env is only available in Node");
  }

  const env = allServer();
  const parsed = ServerEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(fromZodError(parsed.error));
  }
  return parsed.data;
};

const ClientEnvSchema = z.object({
  VITE_PORT: z.coerce.number().min(1000),
});

const client = () => {
  if (!isBrowser()) {
    throw new Error("Client env is only available in the browser");
  }
  const env = allClient();
  const parsed = ClientEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(fromZodError(parsed.error));
  }
  return parsed.data;
};

export const Env = { server, client, allClient, allServer };
