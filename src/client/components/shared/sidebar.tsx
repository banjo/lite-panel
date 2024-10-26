import { DashboardIcon } from "@radix-ui/react-icons";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";
import { PackagePlus } from "lucide-react";
import { Link } from "@tanstack/react-router";

const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: DashboardIcon,
    },
    {
        title: "Create",
        url: "/create",
        icon: PackagePlus,
    },
];

export const AppSidebar = () => (
    <Sidebar>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map(item => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
);
