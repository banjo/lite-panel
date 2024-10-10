import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { hc } from "hono/client";
import type { AppType } from "../server/app";
import { Env } from "../utils/env";

const env = Env.client();
const client = hc<AppType>(`http://localhost:${env.VITE_PORT}`);

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const run = async () => {
      const t = await client.api.hello.$get().then((r) => r.json());
      console.log(t.message);
    };

    run();
  }, []);
  return (
    <div>
      <p>Counter: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

function App() {
  return <Counter />;
}

const domNode = document.getElementById("root");
const root = createRoot(domNode!);
root.render(<App />);
