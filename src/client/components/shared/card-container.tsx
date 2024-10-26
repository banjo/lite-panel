import { PropsWithChildren } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type CardContainerProps = PropsWithChildren<{ title: string }>;
export const CardContainer = ({ children, title }: CardContainerProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{children}</CardContent>
        </Card>
    );
};
