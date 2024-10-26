import { client } from "@/client/client";
import { authInfoQueryKey, authInfoQueryOptions } from "@/client/queries/auth-info-query";
import { AuthLogin, AuthLoginSchema } from "@/models/auth-login-schema";
import { cn } from "@/utils/utils";
import { Maybe, wrapAsync } from "@banjoanton/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Frown, LockIcon, ShieldMinus, ShieldPlus, Smile } from "lucide-react";
import { PropsWithChildren, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { CardContainer } from "../shared/card-container";
import { MutedInfo } from "../shared/muted-info";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { queryClient } from "@/client/common/providers/query-provider";

type DialogContentContainerProps = {
    authInfo: {
        isActive: boolean;
        username: Maybe<string>;
    };
    setOpen: (open: boolean) => void;
};

const DialogContentContainer = ({ authInfo, setOpen }: DialogContentContainerProps) => {
    const form = useForm<AuthLogin>({
        resolver: zodResolver(AuthLoginSchema),
        defaultValues: {
            password: "",
            username: authInfo.username ?? "",
        },
    });

    const onSubmit: SubmitHandler<AuthLogin> = async data => {
        const [_, error] = await wrapAsync(async () => {
            return await client.api.server.auth.$post({ json: data });
        });

        if (error) {
            toast.error(error.message);
            return;
        }

        queryClient.invalidateQueries({ queryKey: authInfoQueryKey });

        setOpen(false);
        form.reset();
        toast.success("Successfully updated auth information");
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Auth information</DialogTitle>
                        <DialogDescription>
                            {authInfo.isActive
                                ? "Update your account information"
                                : "Activate your account"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input defaultValue={authInfo.username} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

const Wrapper = ({ children }: PropsWithChildren) => (
    <CardContainer title="Basic Auth">{children}</CardContainer>
);

export const AuthContainer = () => {
    const { data: authInfo, error, isLoading } = useSuspenseQuery(authInfoQueryOptions);
    const [open, setOpen] = useState(false);

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

    const deactivateAuth = async () => {
        const [_, error] = await wrapAsync(async () => {
            return await client.api.server.auth.deactivate.$post();
        });

        if (error) {
            toast.error(error.message);
            return;
        }

        queryClient.invalidateQueries({ queryKey: authInfoQueryKey });
        toast.success("Successfully deactivated auth");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContentContainer authInfo={authInfo} setOpen={setOpen} />
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
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1">
                                    <LockIcon className="mr-2 h-4 w-4" />
                                    Change
                                </Button>
                            </DialogTrigger>
                        ) : null}

                        {authInfo.isActive ? (
                            <Button variant="outline" className="flex-1" onClick={deactivateAuth}>
                                <ShieldMinus className="mr-2 h-4 w-4" />
                                Deactivate
                            </Button>
                        ) : (
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1">
                                    <ShieldPlus className="mr-2 h-4 w-4" />
                                    Activate
                                </Button>
                            </DialogTrigger>
                        )}
                    </div>
                </div>
            </Wrapper>
        </Dialog>
    );
};
