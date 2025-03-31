import "./index.css";
import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "./context/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider />
  </React.StrictMode>,
);
