import { Env } from "./env";

export const isProduction = Env.NODE_ENV === "production";
