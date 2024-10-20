import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppsOverviewListContainer } from "../components/containers/apps-overview-list-container";
import { ServerInformationContainer } from "../components/containers/server-information-container";
import { Button } from "../components/ui/button";
import { allAppsEnsureData } from "../queries/app-overview-query";
import { systemInformationEnsureData } from "../queries/system-information-query";
import { BasicAuthContainer } from "../components/containers/basic-auth-container";

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
                    <AppsOverviewListContainer />
                </div>
                <div className="flex gap-6 h-72">
                    <div className="flex-1 h-full">
                        <ServerInformationContainer />
                    </div>
                    <div className="flex-1 h-full">
                        <BasicAuthContainer />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Route = createFileRoute("/")({
    component: Index,
    loader: async () => {
        await Promise.all([allAppsEnsureData, systemInformationEnsureData]);
    },
});
