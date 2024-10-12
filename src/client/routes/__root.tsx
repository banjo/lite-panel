import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { SideMenuContainer } from "../components/containers/side-menu-container";

export const Route = createRootRoute({
    component: () => (
        <>
            <div className="flex">
                <SideMenuContainer />
                <Outlet />
            </div>
            <TanStackRouterDevtools />
        </>
    ),
    onError: error => {
        console.log("Error", error);
        throw redirect({ to: "/" });
    },
});
