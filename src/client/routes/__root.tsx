import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { SideMenuContainer } from "../components/containers/side-menu-container";

const RootComponent = () => {
    // @ts-ignore - Vite injects the env, but Env does not work here for some reason
    const isDev = import.meta.env?.DEV;
    return (
        <>
            <div className="flex">
                <SideMenuContainer />
                <Outlet />
            </div>
            {isDev ? <TanStackRouterDevtools /> : null}
        </>
    );
};

export const Route = createRootRoute({
    component: () => <RootComponent />,
    onError: (error: unknown) => {
        console.log("Error", error);
        throw redirect({ to: "/" });
    },
});
