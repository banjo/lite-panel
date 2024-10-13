import { prisma } from "@/db";
import { createLogger } from "@/utils/logger";
import { Result, slugify, wrapAsync } from "@banjoanton/utils";
import { App, AppProxy } from "../models/app-model";
import { CaddyService } from "./caddy-service";
import { DirectoryService } from "./directory-service";

const logger = createLogger("app-service");

type CreateProps = {
    name: string;
    domain: string;
    proxies: AppProxy[];
};

const create = async ({ name, proxies, domain }: CreateProps) => {
    let slug = slugify(name);

    const [result, error] = await wrapAsync(
        async () =>
            await prisma.application.findUnique({
                where: {
                    slug,
                },
            })
    );

    if (error) {
        logger.error({ message: error.message }, "Failed to look for application");
        return Result.error(error.message);
    }

    if (result) {
        logger.error({ slug }, "Application slug exists");
        slug = `${slug}-${Date.now()}`;
    }

    const [application, createError] = await wrapAsync(async () => {
        return await prisma.application.create({
            data: {
                name,
                slug,
                domain,
                reverseProxies: {
                    createMany: {
                        data: proxies.map(proxy => ({
                            port: proxy.port,
                            description: proxy.description,
                            subPath: proxy.subPath,
                        })),
                    },
                },
            },
            include: {
                reverseProxies: true,
            },
        });
    });

    if (createError) {
        logger.error({ message: createError.message }, "Failed to create application");
        return Result.error(createError.message);
    }

    const app = App.fromDb(application);
    const appPath = await DirectoryService.createAppDirectory(app);

    if (!appPath.success) {
        logger.error({ message: appPath.message }, "Failed to create app directory");
        return Result.error(appPath.message);
    }

    const addConfigResult = await CaddyService.addConfigToPath(app);

    if (!addConfigResult.success) {
        logger.error({ message: addConfigResult.message }, "Failed to add config to path");
        return Result.error(addConfigResult.message);
    }

    const updateDefaultResult = await CaddyService.addActiveConfigsToDefault();

    if (!updateDefaultResult.success) {
        logger.error({ message: updateDefaultResult.message }, "Failed to update default configs");
        return Result.error(updateDefaultResult.message);
    }

    return Result.ok();
};

const getAll = async () => {
    const [applications, error] = await wrapAsync(
        async () => await prisma.application.findMany({ include: { reverseProxies: true } })
    );

    if (error) {
        logger.error({ error }, "Failed to get applications from database");
        return Result.error(error.message);
    }

    const apps = applications.map(App.fromDb);

    return Result.ok(apps);
};

export const AppService = { create, getAll };
