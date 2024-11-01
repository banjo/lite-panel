import { ControllerErrorData } from "@/server/api/controller-model";
import { InferResponseType } from "hono";
import { ClientResponse } from "hono/client";
import { ApiError } from "../models/api-error";

const queryByClient = async <T, TResponse extends () => Promise<ClientResponse<T>>>(
    callback: TResponse
): Promise<Awaited<InferResponseType<TResponse, 200>>> => {
    const res = await callback();
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

export const FetchService = { queryByClient };
