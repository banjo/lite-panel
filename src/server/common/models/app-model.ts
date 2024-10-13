import { Application } from "@prisma/client";
import { DirectoryService } from "../services/directory-service";

export type App = {
    name: string;
    slug: string;
    directory: string;
    domain: string;
    port: number;
};

const from = (app: App): App => app;
const fromDb = (application: Application): App => {
    const directory = DirectoryService.getAppPath(application.slug);
    return {
        name: application.name,
        slug: application.slug,
        directory,
        domain: application.domain,
        port: application.port,
    };
};

export const App = { from, fromDb };
