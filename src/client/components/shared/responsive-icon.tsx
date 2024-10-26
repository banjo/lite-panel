import { noop } from "@banjoanton/utils";
import { FC } from "react";
import { cn } from "@/utils/utils";
import { IconSize, iconSizeMapper, IconType } from "./icons";
import { Tooltip } from "./tooltip";

type FilterIconProps = {
    Icon: IconType;
    tooltip?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    size?: IconSize;
    enableTooltip?: boolean;
};

export const ResponsiveIcon: FC<FilterIconProps> = ({
    Icon,
    disabled,
    onClick = noop,
    tooltip,
    enableTooltip = false,
    size = "sm",
    className,
}) => (
    <Tooltip tooltip={tooltip} enabled={enableTooltip}>
        <Icon
            className={cn(
                `${iconSizeMapper[size]} 
                    active:opacity-40 
                    ${disabled ? "opacity-30" : "cursor-pointer outline-none hover:opacity-70"}`,
                className
            )}
            onClick={disabled ? noop : onClick}
            disabled={disabled ?? false}
        />
    </Tooltip>
);
