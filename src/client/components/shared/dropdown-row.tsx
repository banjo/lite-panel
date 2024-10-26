import { FC, ReactNode } from "react";
import { IconType } from "./icons";
import { ResponsiveIcon } from "./responsive-icon";

type Props = {
    icon: IconType;
    text: ReactNode;
};

export const DropdownRow: FC<Props> = ({ icon, text }) => (
    <div className="flex items-center">
        <ResponsiveIcon Icon={icon} enableTooltip={false} size="xs" />
        <span className="ml-2">{text}</span>
    </div>
);
