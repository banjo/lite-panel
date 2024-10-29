import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { FetchService } from "../common/services/fetch-service";
import { queryClient } from "../common/providers/query-provider";

export const allAppsQueryKey = ["apps"];

export const allAppsQueryOptions = queryOptions({
    queryKey: allAppsQueryKey,
    queryFn: async () => await FetchService.queryByClient(client.api.apps.$get),
});

export const allAppsEnsureData = async () => await queryClient.ensureQueryData(allAppsQueryOptions);
