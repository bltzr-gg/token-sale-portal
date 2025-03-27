import { Providers } from "./context/providers";
import { Outlet } from "react-router-dom";
import { AppFooter } from "modules/app/app-footer";
import ScrollToTop from "modules/app/scroll-to-top";
import Navbar from "components/navbar";

function App() {
  return (
    <Providers>
      <ScrollToTop />
      <div className="bg-background min-h-dvh overflow-x-hidden lg:overflow-x-visible">
        <Navbar />
        <div className="container mx-auto px-3">
          <Outlet />
          <AppFooter />
        </div>
      </div>
    </Providers>
  );
}

export default App;
