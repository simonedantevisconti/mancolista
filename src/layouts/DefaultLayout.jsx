import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InstallApp from "../components/InstallApp";

const DefaultLayout = () => {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        <div className="page-reveal" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      <Footer />
      <InstallApp />
    </div>
  );
};

export default DefaultLayout;
