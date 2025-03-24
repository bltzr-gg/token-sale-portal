import {
  createHashRouter,
  RouterProvider as ReactRouterProvider,
} from "react-router-dom";
import ErrorPage from "../pages/error-page";
import AuctionPage from "../pages/home";
import App from "src/App";

const router: ReturnType<typeof createHashRouter> = createHashRouter([
  {
    path: "/*",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [{ path: "", element: <AuctionPage /> }],
  },
]);

export default function RouterProvider() {
  return <ReactRouterProvider router={router} />;
}

export { RouterProvider };
