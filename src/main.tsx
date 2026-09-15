import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";
import App from "../src/App";


createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);