import { Hono } from "hono";

export const api = new Hono().get("/hello", c => {
    return c.json({ message: "Hello Hono!" });
});
