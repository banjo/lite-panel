export const APP_TYPES = ["DOCKER_COMPOSE", "DOCKERFILE"] as const;
export type AppType = (typeof APP_TYPES)[number];
