import { HTMLMotionProps } from "framer-motion";
import { FC, ReactNode } from "react";
import { BadgeProps, Badge as UiBadge } from "../ui/badge";
import { Animated } from "./animated";
import { Tooltip } from "./tooltip";

type Props = {
    children: ReactNode;
    tooltip?: string;
    show: boolean;
    animate?: HTMLMotionProps<"div">;
} & BadgeProps;

export const Badge: FC<Props> = ({ children, tooltip, show, animate, ...props }) => (
    <Animated show={show} {...animate}>
        <Tooltip tooltip={tooltip}>
            <div>
                <UiBadge {...props}>{children}</UiBadge>
            </div>
        </Tooltip>
    </Animated>
);
