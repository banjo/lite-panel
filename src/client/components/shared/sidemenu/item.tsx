import { FC, ReactNode } from "react";
import { Badge } from "../badge";
import { IconType } from "../icons";
import { Tooltip } from "../tooltip";
import { Link } from "@tanstack/react-router";

type ItemProps = {
    title: string;
    Icon?: IconType;
    image?: string | null;
    url: string;
    selected: boolean;
    highlight?: boolean;
    notification?: ReactNode;
    notificationTooltip?: string;
    onClick?: () => void;
};

export const Item: FC<ItemProps> = ({
    title,
    Icon,
    notification,
    notificationTooltip,
    url,
    image,
    selected = false,
    highlight = false,
    onClick,
}) => {
    const selectedClasses = selected
        ? "bg-slate-100 dark:bg-slate-800"
        : "hover:bg-slate-50 dark:hover:bg-slate-900";

    const highlightClasses = highlight ? "font-semibold" : "";

    return (
        <Link
            to={url}
            onClick={onClick}
            className={`text-foreground relative flex h-10 w-full cursor-pointer items-center justify-between gap-4 rounded
            px-4 md:w-72 md:px-6
            ${selectedClasses}
            ${highlightClasses}
            `}
        >
            <div className="relative flex items-center gap-4 overflow-hidden">
                <span className="h-6 w-6 ">
                    {Icon ? <Icon className="h-6 w-6" /> : null}
                    {image ? <img src={image} className="h-6 w-6 max-w-none" /> : null}
                </span>
                <Tooltip tooltip={title}>
                    <span className="w-full truncate text-lg md:w-36 md:text-sm">{title}</span>
                </Tooltip>
            </div>

            <Badge className="" show={Boolean(notification)} tooltip={notificationTooltip ?? ""}>
                {notification}
            </Badge>
        </Link>
    );
};
