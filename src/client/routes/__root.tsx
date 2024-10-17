import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { SideMenuContainer } from "../components/containers/side-menu-container";
import { Env } from "@/utils/env";

const env = Env.client();

export const Route = createRootRoute({
    component: () => (
        <>
            <div className="flex">
                <SideMenuContainer />
                <Outlet />
            </div>
            {env.DEV ? <TanStackRouterDevtools /> : null}
        </>
    ),
    onError: (error: unknown) => {
        console.log("Error", error);
        throw redirect({ to: "/" });
    },
});
