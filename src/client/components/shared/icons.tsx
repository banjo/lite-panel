import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    LayoutGrid as CardLayout,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X as Close,
    Eye,
    EyeOff,
    FileUp,
    Menu as Hamburger,
    Home,
    Info,
    LayoutDashboard as Layout,
    LayoutList,
    Link,
    ListChecks,
    StretchHorizontal as ListLayout,
    LogOut,
    Moon,
    MoreHorizontal,
    PlusCircle,
    RefreshCw as Refresh,
    Settings,
    Star,
    SunMedium,
    Twitter,
    type LucideProps,
} from "lucide-react";
import { FC } from "react";

export type IconType = FC<
    LucideProps & {
        disabled?: boolean;
    }
>;
export type IconSize = "xs" | "sm" | "md" | "lg";

export const iconSizeMapper: Record<IconSize, string> = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
};

export const Icons = {
    home: Home,
    sun: SunMedium,
    moon: Moon,
    twitter: Twitter,
    bookmark: Bookmark,
    layout: LayoutList,
    add: PlusCircle,
    star: Star,
    info: Info,
    chevronDown: ChevronDown,
    chevronRight: ChevronRight,
    chevronLeft: ChevronLeft,
    horizontalMenu: MoreHorizontal,
    listCheck: ListChecks,
    check: Check,
    eye: Eye,
    eyeOff: EyeOff,
    settings: Settings,
    hamburger: Hamburger,
    close: Close,
    refresh: Refresh,
    fileUp: FileUp,
    signOut: LogOut,
    layoutDashboard: Layout,
    layoutCard: CardLayout,
    layoutList: ListLayout,
    arrowRight: ArrowRight,
    arrowLeft: ArrowLeft,
    link: Link,
};
