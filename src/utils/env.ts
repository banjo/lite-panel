import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().min(1000).optional(),
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .default("development"),
});

export const Env = envSchema.parse(process.env);

export type Environment = z.infer<typeof envSchema>;
