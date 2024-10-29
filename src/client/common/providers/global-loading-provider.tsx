import { Maybe, noop } from "@banjoanton/utils";
import { createContext, PropsWithChildren, useContext, useState } from "react";

type Props = {
    isLoading: boolean;
    text: Maybe<string>;
};

export const Spinner = ({ radius = "3rem" }: { radius?: string }) => (
    <div
        className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        style={{ height: radius, width: radius }}
        role="status"
    />
);

export const FullScreenLoading = ({ isLoading, text }: Props) => {
    if (!isLoading) {
        return null;
    }

    return (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center gap-4 backdrop-blur-sm">
            <Spinner />
            <span>{text}</span>
        </div>
    );
};

export type LoadingType = {
    isLoading: boolean;
    setLoading: (isLoading: boolean, text?: string) => void;
};

const LoadingContext = createContext<LoadingType>({ isLoading: false, setLoading: noop });
export const useLoading = () => useContext(LoadingContext);
export const GlobalLoadingProvider = ({ children }: PropsWithChildren) => {
    const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
    const [textGlobal, setTextGlobal] = useState<Maybe<string>>();

    const setLoading = (isLoading: boolean, text?: string) => {
        setIsLoadingGlobal(isLoading);
        setTextGlobal(text);
    };

    return (
        <LoadingContext.Provider value={{ isLoading: isLoadingGlobal, setLoading }}>
            <FullScreenLoading isLoading={isLoadingGlobal} text={textGlobal} />
            {children}
        </LoadingContext.Provider>
    );
};
