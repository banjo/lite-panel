import { PropsWithChildren } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type CardContainerProps = PropsWithChildren<{ title: string }>;
export const CardContainer = ({ children, title }: CardContainerProps) => {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent className="relative h-full">{children}</CardContent>
        </Card>
    );
};
