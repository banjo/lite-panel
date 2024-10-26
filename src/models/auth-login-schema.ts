import { z } from "zod";

export const AuthLoginSchema = z.object({
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(20, { message: "Username must be at most 20 characters long" }),
    password: z.string().min(5, { message: "Password must be at least 5 characters long" }),
});

export type AuthLogin = z.infer<typeof AuthLoginSchema>;
