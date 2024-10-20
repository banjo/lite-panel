import { systemInformationQueryOptions } from "@/client/queries/system-information-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Cpu, HardDrive, MemoryStick, Server, Wifi } from "lucide-react";
import { PropsWithChildren } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const Wrapper = ({ children }: PropsWithChildren) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Server Information</CardTitle>
            </CardHeader>

            <CardContent>{children}</CardContent>
        </Card>
    );
};

export const ServerInformationContainer = () => {
    const { data: serverInfo, isLoading, error } = useSuspenseQuery(systemInformationQueryOptions);
    if (isLoading) {
        return (
            <Wrapper>
                <p className="text-muted-foreground">Loading...</p>
            </Wrapper>
        );
    }

    if (error) {
        return (
            <Wrapper>
                <p className="text-muted-foreground">Ops, something went wrong</p>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
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
        </Wrapper>
    );
};
