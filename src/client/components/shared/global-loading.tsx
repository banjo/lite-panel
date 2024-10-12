import { Maybe } from "@banjoanton/utils";
import { PropsWithChildren } from "react";

type Props = {
    isLoading: boolean;
    text: Maybe<string>;
};

export const Loader = ({ children }: PropsWithChildren) => (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center gap-4 backdrop-blur-sm">
        <div
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
        />
        <span>{children}</span>
    </div>
);

export const GlobalLoading = ({ isLoading, text }: Props) => {
    if (!isLoading) {
        return null;
    }

    return <Loader>{text}</Loader>;
};
