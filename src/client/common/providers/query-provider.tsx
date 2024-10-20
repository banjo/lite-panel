import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { ApiError } from "../models/api-error";

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error: Error) => {
            // TODO: Handle error
            if (ApiError.isApiError(error)) {
                console.error(error.message);
            } else {
                console.error(error.message);
            }
        },
    }),
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: true,
        },
    },
});

type Props = PropsWithChildren & {};
export const QueryProvider = ({ children }: Props) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
