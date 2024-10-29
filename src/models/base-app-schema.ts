import { z } from "zod";
import { APP_TYPES } from "./app-types-model";

export const BaseAppSchema = z.object({
    name: z.string({ message: "Name is required" }).min(1, { message: "Name is required" }),
    domain: z.string({ message: "Domain is required" }).min(1, { message: "Domain is required" }),
    type: z.enum(APP_TYPES),
    port: z.coerce.number().min(1024, { message: "Port must be greater than 1024" }),
});

export type BaseApp = z.infer<typeof BaseAppSchema>;
