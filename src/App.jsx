import { BrowserRouter, Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import Homepage from "./pages/Homepage";
import Favourites from "./pages/Favourites";
import Login from "./pages/Login";
import CollectionDetail from "./pages/CollectionDetail";
import SeriesDetail from "./pages/SeriesDetail";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/le-mie-collezioni" element={<Favourites />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/collezioni/:collectionId"
              element={<CollectionDetail />}
            />
            <Route
              path="/collezioni/:collectionId/:seriesId"
              element={<SeriesDetail />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
