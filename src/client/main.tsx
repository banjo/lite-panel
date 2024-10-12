import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

import { ControllerErrorData } from "@/server/api/controller-model";
import { QueryCache, QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ClientResponse, hc, InferResponseType } from "hono/client";
import type { AppType } from "../server/app";
import { Env } from "../utils/env";

const env = Env.client();
const client = hc<AppType>(`http://localhost:${env.VITE_PORT}`);

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error: Error) => {
            // TODO: Handle error
            if (error instanceof ApiError) {
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

type ErrorType = "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "INTERNAL_SERVER_ERROR";

class ApiError extends Error {
    public type: ErrorType;

    constructor(message: string, type: ErrorType) {
        super(message);
        this.name = this.constructor.name;
        this.type = type;
        Error.captureStackTrace(this, this.constructor);
    }

    isApiError = (error: Error): error is ApiError => {
        return error instanceof ApiError;
    };
}

const fetchHandler = async <TResponse extends () => Promise<ClientResponse<any>>>(
    call: TResponse
): Promise<Awaited<InferResponseType<TResponse, 200>>> => {
    const res = await call();
    if (res.status !== 200) {
        const errorData: ControllerErrorData = (await res.json()) as ControllerErrorData;
        if (res.status === 404) {
            throw new ApiError(errorData.message, "NOT_FOUND");
        } else if (res.status === 401) {
            throw new ApiError(errorData.message, "UNAUTHORIZED");
        } else if (res.status === 403) {
            throw new ApiError(errorData.message, "FORBIDDEN");
        } else {
            throw new ApiError(errorData.message, "INTERNAL_SERVER_ERROR");
        }
    }
    return (await res.json()) as Awaited<InferResponseType<TResponse, 200>>;
};

function Counter() {
    const [count, setCount] = useState(0);
    const { error, data, isLoading } = useQuery({
        queryKey: ["hello"],
        queryFn: async () => {
            return await fetchHandler(client.api.hello.$get);
        },
    });

    console.log({ error, data, isLoading });

    // useEffect(() => {
    //     const run = async () => {
    //         const t = await client.api.hello.$get().then(d => d.json());
    //     };
    //
    //     run();
    // }, []);
    return (
        <div className="bg-red-300">
            <p>Counter: {count}</p>
            <button type="button" onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Counter />
        </QueryClientProvider>
    );
}

const domNode = document.getElementById("root");
const root = createRoot(domNode!);
root.render(<App />);
