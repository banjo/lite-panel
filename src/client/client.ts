import { AppType } from "@/server/app";
import { Env } from "@/utils/env";
import { hc } from "hono/client";

const env = Env.client();
export const client = hc<AppType>(env.VITE_SERVER_URL);
