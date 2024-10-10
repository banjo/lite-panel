import { Env } from "./env";

const env = Env.server();
export const isProduction = env.NODE_ENV === "production";
