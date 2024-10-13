import { Application, ReverseProxy } from "@prisma/client";

export type ApplicationWithReverseProxy = Application & {
    reverseProxies: ReverseProxy[];
};
