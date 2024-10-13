import { ApplicationWithReverseProxy } from "prisma/model";
import { DirectoryService } from "../services/directory-service";

export type AppProxy = {
    port: number;
    description?: string;
    subPath?: string;
};

export const AppProxy = {
    from: (proxy: AppProxy): AppProxy => proxy,
};

export type App = {
    name: string;
    slug: string;
    directory: string;
    domain: string;
    proxies: AppProxy[];
};

const from = (app: App): App => app;
const fromDb = (application: ApplicationWithReverseProxy): App => {
    const directory = DirectoryService.getAppPath(application.slug);
    return {
        name: application.name,
        slug: application.slug,
        domain: application.domain,
        directory,
        proxies: application.reverseProxies?.map(proxy => ({
            description: proxy.description ?? undefined,
            port: proxy.port,
            subPath: proxy.subPath ?? undefined,
        })),
    };
};

export const App = { from, fromDb };
