import { z } from "zod";
import { BaseAppSchema } from "./base-app-schema";

export const ComposeMeta = z.object({
    composeFileContent: z.string().min(1, { message: "Compose file content is required" }),
});
export type ComposeMeta = z.infer<typeof ComposeMeta>;

export const CreateComposeAppSchema = BaseAppSchema.merge(ComposeMeta);
export type CreateComposeApp = z.infer<typeof CreateComposeAppSchema>;
