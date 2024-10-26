import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppsOverviewListContainer } from "../components/containers/apps-overview-list-container";
import { AuthContainer } from "../components/containers/auth-container";
import { ServerInformationContainer } from "../components/containers/server-information-container";
import { Button } from "../components/ui/button";
import { allAppsEnsureData } from "../queries/app-overview-query";
import { authInfoEnsureData } from "../queries/auth-info-query";
import { systemInformationEnsureData } from "../queries/system-information-query";

const Index = () => (
    <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">VPS Dashboard</h1>
            <Button asChild>
                <Link to="/create">
                    <Plus className="mr-2 h-4 w-4" /> Create
                </Link>
            </Button>
        </header>
        <div className="grid gap-6">
            <div className="w-full">
                <AppsOverviewListContainer />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <ServerInformationContainer />
                <AuthContainer />
            </div>
        </div>
    </div>
);

export const Route = createFileRoute("/")({
    component: Index,
    loader: async () => {
        await Promise.all([allAppsEnsureData, systemInformationEnsureData, authInfoEnsureData]);
    },
});
