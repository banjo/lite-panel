import { PropsWithChildren } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export type CardContainerProps = PropsWithChildren<{ title: string; description?: string }>;
export const CardContainer = ({ children, title, description }: CardContainerProps) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>

        <CardContent>{children}</CardContent>
    </Card>
);
