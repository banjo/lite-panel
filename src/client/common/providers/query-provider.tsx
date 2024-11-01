import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { ApiError } from "../models/api-error";
import toast from "react-hot-toast";

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error: Error) => {
            toast.error(error.message);
            if (ApiError.isApiError(error)) {
                console.error(error);
            } else {
                console.error(error);
            }
        },
    }),
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: true,
        },
        mutations: {
            onError: (error: Error) => {
                toast.error(error.message);
            },
        },
    },
});

type Props = PropsWithChildren & {};
export const QueryProvider = ({ children }: Props) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
