import { useState } from "react";
import "./style.css";

import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import type { AppType } from "../server/app";
import { Env } from "../utils/env";
import { FetchService } from "./common/services/fetch-service";

const env = Env.client();
const client = hc<AppType>(`http://localhost:${env.VITE_PORT}`);

export const Counter = () => {
    const [count, setCount] = useState(0);
    const { error, data, isLoading } = useQuery({
        queryKey: ["hello"],
        queryFn: async () => await FetchService.queryByClient(() => client.api.hello.$get()),
    });

    console.log({ error, data, isLoading });

    return (
        <div className="bg-red-300">
            <p>Counter: {count}</p>
            <button type="button" onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
};
