import { CreateComposeApp, CreateComposeAppSchema } from "@/models/create-compose-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { PropsWithChildren } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { CardContainer, CardContainerProps } from "../components/shared/card-container";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

const Wrapper = ({ children, title, description }: CardContainerProps) => (
    <CardContainer title={title} description={description}>
        {children}
    </CardContainer>
);

const CreateComposeContainer = () => {
    const form = useForm<CreateComposeApp>({
        resolver: zodResolver(CreateComposeAppSchema),
        defaultValues: {
            type: "DOCKER_COMPOSE",
            port: 0,
            name: "",
            domain: "",
            composeFileContent: "",
        },
    });

    const onSubmit: SubmitHandler<CreateComposeApp> = async data => console.log(data);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Wrapper
                    title="Compose"
                    description="An application created by with Docker Compose."
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>The name of the application</FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="domain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Domain</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>No HTTPS (e.g. example.com)</FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="port"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Port</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>
                                        Which port the application should use locally and connect to
                                        the SSL certificate
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="composeFileContent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Compose file</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The content of the compose.yml file
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex w-full justify-end mt-8">
                        <Button type="submit">Create</Button>
                    </div>
                </Wrapper>
            </form>
        </Form>
    );
};

const Create = () => {
    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Create application</h1>
            </header>
            <Tabs defaultValue="compose" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="compose">Compose</TabsTrigger>
                </TabsList>
                <TabsContent value="compose">
                    <CreateComposeContainer />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export const Route = createFileRoute("/create")({
    component: Create,
});
