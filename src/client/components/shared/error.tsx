import { FC } from "react";

export const ErrorPage: FC = () => (
    <div className="flex h-full flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="text-lg text-gray-500">Please try again later</p>
    </div>
);
