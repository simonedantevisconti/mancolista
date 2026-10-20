import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthProvider";
import DefaultLayout from "./layouts/DefaultLayout";

import "./index.css";

const Homepage = lazy(() => import("./pages/Homepage"));
const Favourites = lazy(() => import("./pages/Favourites"));
const Login = lazy(() => import("./pages/Login"));
const Account = lazy(() => import("./pages/Account"));
const RequestCollection = lazy(() => import("./pages/RequestCollection"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const CollectionItemDetail = lazy(() => import("./pages/CollectionItemDetail"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookie = lazy(() => import("./pages/Cookie"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => {
  return (
    <section className="page-loader">
      <div className="page-loader__spinner" />

      <p>Caricamento...</p>
    </section>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<DefaultLayout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/impostazioni" element={<Account />} />
              <Route path="/richiedi-collezione" element={<RequestCollection />} />

              <Route path="/le-mie-collezioni" element={<Favourites />} />

              <Route
                path="/collezioni/:collectionId"
                element={<CollectionDetail />}
              />

              <Route
                path="/collezioni/:collectionId/:seriesId"
                element={<CollectionItemDetail />}
              />

              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookie" element={<Cookie />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
