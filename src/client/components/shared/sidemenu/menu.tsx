import { FC, ReactNode, useEffect } from "react";

type Props = {
    isOpen: boolean;
    children: ReactNode;
    closeButton?: ReactNode;
};

export const Menu: FC<Props> = ({ children, isOpen, closeButton }) => {
    // Prevent scrolling when the menu is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    return (
        <aside
            className={`md:h-full-with-nav bg-background dark:bg-background fixed inset-0 z-40
                h-screen w-full transform overflow-y-scroll px-4 py-8
                pt-16 transition-transform
                ease-in-out md:relative
                md:z-0
                md:w-80
                md:transform-none md:border-r md:px-0
                md:py-4 md:duration-0
                ${isOpen ? "duration-500" : "-translate-y-[120%] md:translate-y-0"}
                
        `}
        >
            {closeButton}
            <div className="relative">{children}</div>
        </aside>
    );
};
