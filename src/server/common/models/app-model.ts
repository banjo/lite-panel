import { attempt, includes, merge } from "@banjoanton/utils";
import { ApplicationWithReverseProxy } from "prisma/model";
import { DirectoryService } from "../services/directory-service";
import { APP_TYPES, AppType } from "@/models/app-types-model";

export type DockerComposeMeta = {
    composeFileContent: string;
};

export type DockerfileMeta = {
    dockerfileContent: string;
};

export type AppProxy = {
    port: number;
    description?: string;
    subPath?: string;
};

export const AppProxy = {
    from: (proxy: AppProxy): AppProxy => proxy,
};

type BaseApp = {
    name: string;
    slug: string;
    directory: string;
    domain: string;
    proxies: AppProxy[];
    type: AppType;
    isRunning: boolean;
};

export type DockerComposeApp = BaseApp & {
    type: "DOCKER_COMPOSE";
    meta: DockerComposeMeta;
};

export type DockerfileApp = BaseApp & {
    type: "DOCKERFILE";
    meta: DockerfileMeta;
};

export type App = DockerComposeApp | DockerfileApp;

const from = (app: App): App => app;
const fromDb = (application: ApplicationWithReverseProxy): App => {
    const directory = DirectoryService.getAppPath(application.slug);

    if (!includes(APP_TYPES, application.type)) {
        throw new Error(`Invalid application type: ${application.type}`);
    }

    const meta = attempt(() => JSON.parse(application?.meta ?? "{}"));

    const app = from({
        name: application.name,
        slug: application.slug,
        domain: application.domain,
        type: application.type,
        directory,
        meta,
        isRunning: application.isRunning,
        proxies: application.reverseProxies?.map(proxy => ({
            description: proxy.description ?? undefined,
            port: proxy.port,
            subPath: proxy.subPath ?? undefined,
        })),
    });

    return app;
};

const update = (app: App, props: Partial<App>): App => merge(app, props);

const isDockerComposeApp = (app: App): app is DockerComposeApp => app.type === "DOCKER_COMPOSE";
const isDockerfileApp = (app: App): app is DockerfileApp => app.type === "DOCKERFILE";

export const App = { from, fromDb, isDockerComposeApp, isDockerfileApp, update };
