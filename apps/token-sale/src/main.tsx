import "./index.css";
import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "./context/router";
import { initializeVerifiedFetch } from "utils/verified-fetch";

async function initialize() {
  await initializeVerifiedFetch();
}

initialize().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider />
    </React.StrictMode>,
  );
});
