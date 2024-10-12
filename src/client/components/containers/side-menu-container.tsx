import { useLocation } from "@tanstack/react-router";
import { AppWindow, LayoutDashboard, Logs } from "lucide-react";
import { useState } from "react";
import { SideMenu } from "../shared";

export const SideMenuContainer = () => {
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const isSelected = (url: string) => pathname === url;
    return (
        <SideMenu.Menu isOpen={isOpen}>
            <SideMenu.Item
                Icon={LayoutDashboard}
                title="Dashboard"
                url="/"
                selected={isSelected("/")}
            />
            <SideMenu.Item
                Icon={AppWindow}
                title="Apps"
                url="/apps"
                selected={isSelected("/apps")}
            />
            <SideMenu.Item Icon={Logs} title="Logs" url="/logs" selected={isSelected("/logs")} />
        </SideMenu.Menu>
    );
};
