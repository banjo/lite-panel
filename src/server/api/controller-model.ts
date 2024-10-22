import { Context } from "hono";
import { JSONValue } from "hono/utils/types";

export type ControllerErrorData = {
    message: string;
    meta?: Record<string, unknown>;
};

export function SuccessResponse(c: Context): void;
export function SuccessResponse<TData extends JSONValue>(c: Context, data: TData): void;
export function SuccessResponse<TData extends JSONValue>(c: Context, data?: TData): void {
    c.json(data ?? { success: true }, 200);
}

export const ErrorResponse = (c: Context, data: ControllerErrorData) => c.json(data, 500);
export const NotFoundResponse = (c: Context, data: ControllerErrorData) => c.json(data, 404);
export const UnauthorizedResponse = (c: Context, data: ControllerErrorData) => c.json(data, 401);
export const ForbiddenResponse = (c: Context, data: ControllerErrorData) => c.json(data, 403);
