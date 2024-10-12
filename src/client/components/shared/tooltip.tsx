import { FC, ReactNode } from "react";
import {
    Tooltip as TooltipBase,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

type Props = {
    tooltip?: string;
    children: ReactNode;
    enabled?: boolean;
};

export const Tooltip: FC<Props> = ({ tooltip, children, enabled = true }) => {
    if (!enabled) return <>{children}</>;

    return (
        <TooltipProvider>
            <TooltipBase>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </TooltipBase>
        </TooltipProvider>
    );
};
