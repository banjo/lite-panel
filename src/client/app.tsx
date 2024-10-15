import { createRoot } from "react-dom/client";
import { QueryProvider } from "./common/providers/query-provider";
import { Counter } from "./main";
import "./style.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const App = () => {
    return (
        <QueryProvider>
            <RouterProvider router={router} />
        </QueryProvider>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
