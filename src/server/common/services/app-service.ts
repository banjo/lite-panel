import { prisma } from "@/db";
import { createLogger } from "@/utils/logger";
import { isEmpty, Result, uuid, wrapAsync } from "@banjoanton/utils";
import { App, AppProxy, AppType } from "../models/app-model";
import { CaddyService } from "./caddy-service";
import { DirectoryService } from "./directory-service";

const logger = createLogger("app-service");

export type CreateAppProps = {
    name: string;
    domain: string;
    proxies: AppProxy[];
    type: AppType;
    meta: Record<string, any>;
};

const create = async ({ name, proxies, domain, type, meta }: CreateAppProps) => {
    const slug = uuid();

    const ports = proxies.map(proxy => proxy.port);
    const [proxiesWithSamePort, portError] = await wrapAsync(async () => {
        return await prisma.reverseProxy.findMany({
            where: {
                port: {
                    in: ports,
                },
            },
        });
    });

    if (portError) {
        logger.error({ message: portError.message }, "Failed to look for proxies with same port");
        return Result.error(portError.message);
    }

    if (!isEmpty(proxiesWithSamePort)) {
        const portsInUse = proxiesWithSamePort.map(p => p.port);
        logger.error({ ports: portsInUse }, "Port is already in use");
        return Result.error(`Port is already in use: ${portsInUse.join(", ")}`);
    }

    const [application, createError] = await wrapAsync(async () => {
        return await prisma.application.create({
            data: {
                name,
                slug,
                domain,
                type,
                meta: JSON.stringify(meta),
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

    const updateDefaultResult = await CaddyService.addAppConfigsToDefault();

    if (!updateDefaultResult.success) {
        logger.error({ message: updateDefaultResult.message }, "Failed to update default configs");
        return Result.error(updateDefaultResult.message);
    }

    const reloadResult = await CaddyService.reload();

    if (!reloadResult.success) {
        logger.error({ message: reloadResult.message }, "Failed to reload Caddy");
        return Result.error(reloadResult.message);
    }

    return Result.ok(app);
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

const getBySlug = async (slug: string) => {
    const [application, error] = await wrapAsync(
        async () =>
            await prisma.application.findUnique({
                where: { slug },
                include: { reverseProxies: true },
            })
    );

    if (error) {
        logger.error({ error }, "Failed to get application from database");
        return Result.error(error.message);
    }

    if (!application) {
        logger.error({ slug }, "Application not found");
        return Result.error("Application not found");
    }

    const app = App.fromDb(application);

    return Result.ok(app);
};

const update = async (app: App) => {
    const [updatedApp, error] = await wrapAsync(
        async () =>
            await prisma.application.update({
                where: { slug: app.slug },
                data: {
                    name: app.name,
                    domain: app.domain,
                    meta: JSON.stringify(app.meta),
                },
                include: { reverseProxies: true },
            })
    );

    if (error) {
        logger.error({ error }, "Failed to update application in database");
        return Result.error(error.message);
    }

    return Result.ok(App.fromDb(updatedApp));
};

const deleteApp = async (slug: string) => {
    const [application, error] = await wrapAsync(
        async () =>
            await prisma.application.findUnique({
                where: { slug },
                include: { reverseProxies: true },
            })
    );

    if (error) {
        logger.error({ error }, "Failed to get application from database");
        return Result.error(error.message);
    }

    if (!application) {
        logger.error({ slug }, "Application not found");
        return Result.error("Application not found");
    }

    const app = App.fromDb(application);

    const deleteResult = await DirectoryService.removeAppDirectory(app.slug);

    if (!deleteResult.success) {
        logger.error({ message: deleteResult.message }, "Failed to delete app directory");
        return Result.error(deleteResult.message);
    }

    const [_, deleteAppError] = await wrapAsync(
        async () => await prisma.application.delete({ where: { slug } })
    );

    if (deleteAppError) {
        logger.error({ error: deleteAppError }, "Failed to delete application from database");
        return Result.error(deleteAppError.message);
    }

    return Result.ok();
};

export const AppService = { create, getAll, getBySlug, update, deleteApp };
