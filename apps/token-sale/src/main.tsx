import "./index.css";
import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "./context/router";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://49fcbc65f32961f0c1fb75d4ca83fa05@o4508158923964416.ingest.us.sentry.io/4509098982506496",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider />
  </React.StrictMode>,
);
