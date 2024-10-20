import type { AppType } from "@/server/common/models/app-model";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Cpu, HardDrive, MemoryStick, Plus, Server, Wifi } from "lucide-react";
import { client } from "../client";
import { queryClient } from "../common/providers/query-provider";
import { FetchService } from "../common/services/fetch-service";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const runningAppsQuery = queryOptions({
    queryKey: ["running-apps"],
    queryFn: async () => await FetchService.queryByClient(() => client.api.app.get.$get()),
});

const systemInformationQuery = queryOptions({
    queryKey: ["system-information"],
    queryFn: async () => await FetchService.queryByClient(() => client.api.system.info.$get()),
});

const appTypeTranslations: Record<AppType, string> = {
    DOCKER_COMPOSE: "Docker Compose",
    DOCKERFILE: "Dockerfile",
};

const translate = (type: AppType) => appTypeTranslations[type];

const RunningAppsContainer = () => {
    const { data: apps, isLoading } = useSuspenseQuery(runningAppsQuery);
    const hasNoApps = apps.length === 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
                {hasNoApps && !isLoading ? (
                    <p className="text-muted-foreground">No running apps</p>
                ) : null}
                {isLoading ? <p className="text-muted-foreground">Loading...</p> : null}
                <ul className="space-y-4">
                    {apps.map(app => (
                        <li
                            key={app.slug}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                            <div>
                                <p className="font-medium">{app.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {translate(app.type)}
                                </p>
                            </div>
                            <Badge variant="default">Running</Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

const ServerInformationContainer = () => {
    const { data: serverInfo, isLoading } = useSuspenseQuery(systemInformationQuery);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Server Information</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <p className="text-muted-foreground">Loading...</p> : null}
                <ul className="space-y-4">
                    <li className="flex items-center">
                        <Wifi className="mr-2 h-4 w-4" />
                        <span className="font-medium mr-2">IP:</span>
                        {serverInfo.ipAddress}
                    </li>
                    <li className="flex items-center">
                        <Server className="mr-2 h-4 w-4" />
                        <span className="font-medium mr-2">OS:</span>
                        {serverInfo.os}
                    </li>
                    <li className="flex items-center">
                        <Cpu className="mr-2 h-4 w-4" />
                        <span className="font-medium mr-2">CPU:</span>
                        {serverInfo.cpuCores}
                    </li>
                    <li className="flex items-center">
                        <MemoryStick className="mr-2 h-4 w-4" />
                        <span className="font-medium mr-2">RAM:</span>
                        {serverInfo.totalMemGB} GB
                    </li>
                    <li className="flex items-center">
                        <HardDrive className="mr-2 h-4 w-4" />
                        <span className="font-medium mr-2">Storage:</span>
                        {serverInfo.diskSizeGB} GB
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
};

const Index = () => {
    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">VPS Dashboard</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create App
                </Button>
            </header>
            <div className="grid gap-6 md:grid-cols-1">
                <div className="w-full">
                    <RunningAppsContainer />
                </div>
                <div className="w-auto md:w-fit">
                    <ServerInformationContainer />
                </div>
            </div>
        </div>
    );
};

export const Route = createFileRoute("/")({
    component: Index,
    loader: async () => {
        await queryClient.ensureQueryData(runningAppsQuery);
    },
});
