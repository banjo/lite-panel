import { z } from "zod";
import { BaseAppSchema } from "./base-app-schema";

export const CreateComposeAppSchema = BaseAppSchema.merge(
    z.object({
        composeFileContent: z.string().min(1, { message: "Compose file content is required" }),
    })
);

export type CreateComposeApp = z.infer<typeof CreateComposeAppSchema>;
