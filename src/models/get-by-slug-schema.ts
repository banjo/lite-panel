import { z } from "zod";

export const getBySlugSchema = z.object({
    slug: z.string(),
});
