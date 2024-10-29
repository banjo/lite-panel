import { Maybe, noop } from "@banjoanton/utils";
import { createContext, PropsWithChildren, useContext, useState } from "react";

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
            <GlobalLoading isLoading={isLoadingGlobal} text={textGlobal} />
            {children}
        </LoadingContext.Provider>
    );
};
