import { cn } from "@/utils/utils";
import { Frown, LockIcon, ShieldMinus, ShieldPlus, Smile } from "lucide-react";
import { PropsWithChildren } from "react";
import { CardContainer } from "../shared/card-container";
import { Button } from "../ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { authInfoQueryOptions } from "@/client/queries/auth-info-query";
import { MutedInfo } from "../shared/muted-info";

const Wrapper = ({ children }: PropsWithChildren) => (
    <CardContainer title="Basic Auth">{children}</CardContainer>
);

export const BasicAuthContainer = () => {
    const { data: authInfo, error, isLoading } = useSuspenseQuery(authInfoQueryOptions);

    if (isLoading)
        return (
            <Wrapper>
                <MutedInfo text="Loading..." />
            </Wrapper>
        );
    if (error)
        return (
            <Wrapper>
                <MutedInfo text="Ops, something went wrong" />
            </Wrapper>
        );

    return (
        <Wrapper>
            <div className="flex flex-col justify-between h-52">
                <div className="flex flex-col justify-center items-center flex-grow w-full">
                    {authInfo.isActive ? (
                        <Smile className="w-16 h-16 text-green-500" />
                    ) : (
                        <Frown className="w-16 h-16 text-red-500" />
                    )}

                    {authInfo.isActive ? (
                        <div className="font-semibold mt-2">{authInfo.username}</div>
                    ) : null}
                    <div
                        className={cn("font-light mt-1", {
                            "text-green-500": authInfo.isActive,
                            "text-red-500": !authInfo.isActive,
                        })}
                    >
                        {authInfo.isActive ? "Active" : "Inactive"}
                    </div>
                </div>

                <div className="flex space-x-2">
                    {authInfo.isActive ? (
                        <Button variant="outline" className="flex-1">
                            <LockIcon className="mr-2 h-4 w-4" />
                            Change
                        </Button>
                    ) : null}

                    <Button variant="outline" className="flex-1">
                        {authInfo.isActive ? (
                            <ShieldMinus className="mr-2 h-4 w-4" />
                        ) : (
                            <ShieldPlus className="mr-2 h-4 w-4" />
                        )}
                        {authInfo.isActive ? "Deactivate" : "Activate"}
                    </Button>
                </div>
            </div>
        </Wrapper>
    );
};
