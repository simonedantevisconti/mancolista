import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import DefaultLayout from "./layouts/DefaultLayout";

import "./index.css";

const Homepage = lazy(() => import("./pages/Homepage"));
const Favourites = lazy(() => import("./pages/Favourites"));
const Login = lazy(() => import("./pages/Login"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const CollectionItemDetail = lazy(() => import("./pages/CollectionItemDetail"));
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
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<DefaultLayout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />

              <Route path="/le-mie-collezioni" element={<Favourites />} />

              <Route
                path="/collezioni/:collectionId"
                element={<CollectionDetail />}
              />

              <Route
                path="/collezioni/:collectionId/:seriesId"
                element={<CollectionItemDetail />}
              />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
