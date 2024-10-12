import { FC } from "react";

export type Size = "xs" | "sm" | "md" | "lg";

type Props = {
    size: Size;
};

const mapper: Record<Size, string> = {
    xs: "mb-1",
    sm: "mb-2",
    md: "mb-4",
    lg: "mb-8",
};

export const Divider: FC<Props> = ({ size }) => {
    return <div className={mapper[size]} />;
};
