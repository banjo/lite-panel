import { createRoot } from "react-dom/client";
import { QueryProvider } from "./common/providers/query-provider";
import { Counter } from "./main";
import "./style.css";

const App = () => {
    return (
        <QueryProvider>
            <Counter />
        </QueryProvider>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
