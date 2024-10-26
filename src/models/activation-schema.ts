import { z } from "zod";

export const ActivateSchema = z.object({
    activate: z.boolean(),
});

export type ActivateModel = z.infer<typeof ActivateSchema>;
