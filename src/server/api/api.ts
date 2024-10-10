import { Hono } from "hono";

export const api = new Hono().get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});
