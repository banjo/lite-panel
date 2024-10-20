import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { FetchService } from "../common/services/fetch-service";
import { queryClient } from "../common/providers/query-provider";

export const systemInformationQueryKey = ["system-information"];

export const systemInformationQueryOptions = queryOptions({
    queryKey: systemInformationQueryKey,
    queryFn: async () => await FetchService.queryByClient(() => client.api.server.info.$get()),
});

export const systemInformationEnsureData = async () =>
    await queryClient.ensureQueryData(systemInformationQueryOptions);
