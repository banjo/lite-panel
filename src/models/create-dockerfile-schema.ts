import { z } from "zod";
import { BaseAppSchema } from "./base-app-schema";

export const DockerfileMetaSchema = z.object({
    DockerfileContent: z.string().min(1, { message: "Dockerfile is required" }),
});
export type DockerfileMeta = z.infer<typeof DockerfileMetaSchema>;

export const CreateDockerfileAppSchema = BaseAppSchema.merge(DockerfileMetaSchema);
export type CreateDockerfileApp = z.infer<typeof CreateDockerfileAppSchema>;
