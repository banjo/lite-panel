import { allAppsQueryOptions } from "@/client/queries/app-overview-query";
import { PropsWithChildren } from "react";
import { CardContainer } from "../shared/card-container";
import { MutedInfo } from "../shared/muted-info";
import { Badge } from "../ui/badge";
import { useQuery } from "@tanstack/react-query";
import { AppType } from "@/models/app-types-model";

const appTypeTranslations: Record<AppType, string> = {
    DOCKER_COMPOSE: "Docker Compose",
    DOCKERFILE: "Dockerfile",
};

const translate = (type: AppType) => appTypeTranslations[type];

const Wrapper = ({ children }: PropsWithChildren) => (
    <CardContainer title="Applications">{children}</CardContainer>
);

export const AppsOverviewListContainer = () => {
    const { data: apps, isPending, error } = useQuery(allAppsQueryOptions);

    if (isPending) {
        return (
            <Wrapper>
                <MutedInfo text="Loading..." />
            </Wrapper>
        );
    }

    if (error) {
        return (
            <Wrapper>
                <MutedInfo text="Error loading apps" />
            </Wrapper>
        );
    }

    if (apps.length === 0) {
        return (
            <Wrapper>
                <MutedInfo text="No running apps" />
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <ul className="space-y-4">
                {apps.map(app => (
                    <li
                        key={app.slug}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                        <div>
                            <p className="font-medium">{app.name}</p>
                            <p className="text-sm text-muted-foreground">{translate(app.type)}</p>
                        </div>
                        {app.isRunning ? (
                            <Badge variant="default">Running</Badge>
                        ) : (
                            <Badge variant="outline">Paused</Badge>
                        )}
                    </li>
                ))}
            </ul>
        </Wrapper>
    );
};
