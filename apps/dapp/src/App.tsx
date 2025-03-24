import { Providers } from "./context/providers";
import { Outlet } from "react-router-dom";
import { AppFooter } from "modules/app/app-footer";
import ScrollToTop from "modules/app/scroll-to-top";
import Navbar from "components/navbar";

const disableDevTools =
  import.meta.env.VITE_DISABLE_REACT_QUERY_DEV_TOOLS === "true";

function App() {
  return (
    <Providers disableDevTools={disableDevTools}>
      <ScrollToTop />
      <div className="bg-background flex h-dvh flex-col justify-between overflow-x-hidden lg:overflow-x-visible">
        <div className="flex flex-grow flex-col-reverse lg:flex-col">
          <Navbar />
          <div className="flex-grow">
            <Outlet />
          </div>
        </div>
        <AppFooter />
      </div>
    </Providers>
  );
}

export default App;
