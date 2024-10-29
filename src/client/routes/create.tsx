import { CreateComposeApp, CreateComposeAppSchema } from "@/models/create-compose-schema";
import { CreateDockerfileApp, CreateDockerfileAppSchema } from "@/models/create-dockerfile-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { CardContainer, CardContainerProps } from "../components/shared/card-container";
import { Button } from "../components/ui/button";
import { toast } from "react-hot-toast";
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
import { Textarea } from "../components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { FetchService } from "../common/services/fetch-service";
import { client } from "../client";
import { queryClient } from "../common/providers/query-provider";
import { allAppsQueryKey } from "../queries/app-overview-query";
import { useLoading } from "../common/providers/global-loading-provider";

const Wrapper = ({ children, title, description }: CardContainerProps) => (
    <CardContainer title={title} description={description}>
        {children}
    </CardContainer>
);

type BaseAppFormProps<T> = {
    form: T;
};
const BaseAppForm = <T extends ReturnType<typeof useForm<any>>>({ form }: BaseAppFormProps<T>) => (
    <>
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
                        Which port the application should use locally and connect to the SSL
                        certificate
                    </FormDescription>
                </FormItem>
            )}
        />
    </>
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

    const { setLoading } = useLoading();

    const dockerCompose = useMutation({
        mutationFn: async (data: CreateComposeApp) => {
            await FetchService.queryByClient(() =>
                client.api.compose.create.$post({
                    json: {
                        name: data.name,
                        domain: data.domain,
                        dockerComposeContent: data.composeFileContent,
                        ports: [data.port],
                    },
                })
            );
        },
        onMutate: () => {
            setLoading(true, "Creating application...");
        },
        onSuccess: async (_, data) => {
            queryClient.invalidateQueries({ queryKey: allAppsQueryKey });
            toast.success(`Application ${data.name} created`);
            form.reset();
            // TODO: go to app
        },
        onSettled: () => {
            setLoading(false);
        },
    });

    const onSubmit: SubmitHandler<CreateComposeApp> = async data => dockerCompose.mutate(data);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Wrapper title="Compose" description="An application created with Docker Compose.">
                    <div className="space-y-4">
                        <BaseAppForm form={form} />

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

const CreateDockerfileContainer = () => {
    const form = useForm<CreateDockerfileApp>({
        resolver: zodResolver(CreateDockerfileAppSchema),
        defaultValues: {
            type: "DOCKERFILE",
            port: 0,
            name: "",
            domain: "",
            DockerfileContent: "",
        },
    });

    const onSubmit: SubmitHandler<CreateDockerfileApp> = async data => console.log(data);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Wrapper title="Dockerfile" description="An application created with a Dockerfile.">
                    <div className="space-y-4">
                        <BaseAppForm form={form} />

                        <FormField
                            control={form.control}
                            name="DockerfileContent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dockerfile</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormDescription>The content of the Dockerfile</FormDescription>
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

const Create = () => (
    <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Create application</h1>
        </header>
        <Tabs defaultValue="compose" className="w-[400px]">
            <TabsList>
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="dockerfile">Dockerfile</TabsTrigger>
            </TabsList>
            <TabsContent value="compose">
                <CreateComposeContainer />
            </TabsContent>
            <TabsContent value="dockerfile">
                <CreateDockerfileContainer />
            </TabsContent>
        </Tabs>
    </div>
);

export const Route = createFileRoute("/create")({
    component: Create,
});
