import { Env } from "@/utils/env";
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { SideMenuContainer } from "../components/containers/side-menu-container";

const RootComponent = () => {
    const env = Env.client();
    return (
        <>
            <div className="flex">
                <SideMenuContainer />
                <Outlet />
            </div>
            {env.DEV ? <TanStackRouterDevtools /> : null}
        </>
    );
};

export const Route = createRootRoute({
    component: () => {
        return <RootComponent />;
    },
    onError: (error: unknown) => {
        console.log("Error", error);
        throw redirect({ to: "/" });
    },
});
