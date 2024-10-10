import { useState } from "react";
import { createRoot } from "react-dom/client";

function Counter() {
  const [count, setCount] = useState(0);
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
