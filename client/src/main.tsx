import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { OrderProvider } from "./context/OrderContext";

// Simplified root rendering without WebSocket for now
createRoot(document.getElementById("root")!).render(
  <OrderProvider>
    <App />
  </OrderProvider>
);
