import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FetchService } from "./common/services/fetch-service";
import { client } from "./client";

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
