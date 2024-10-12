import { FC, ReactNode, useState } from "react";
import { Icons } from "../icons";
import { ResponsiveIcon } from "../responsive-icon";

type CategoryProps = {
    title: string;
    children?: ReactNode;
    defaultIsOpen?: boolean;
};

export const Category: FC<CategoryProps> = ({ title, children, defaultIsOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultIsOpen);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <div className="flex items-center justify-between" onClick={toggleOpen}>
                <span className="ml-4 cursor-pointer text-xs font-semibold uppercase tracking-widest text-slate-400 md:ml-8">
                    {title}
                </span>
                <ResponsiveIcon
                    Icon={Icons.chevronDown}
                    className={`mr-8 hidden text-slate-400
                    transition-transform duration-500 ease-in-out
                    md:block
                    ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            {/* Desktop */}
            <div
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                className="hidden transition-['grid-template-rows'] duration-500 ease-in-out md:grid"
            >
                <div className="overflow-hidden">{children}</div>
            </div>

            {/* Mobile */}
            <div className="md:hidden">{children}</div>
        </div>
    );
};
