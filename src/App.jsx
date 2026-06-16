import { BrowserRouter, Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import Homepage from "./pages/Homepage";
import Favourites from "./pages/Favourites";
import Login from "./pages/Login";
import CollectionDetail from "./pages/CollectionDetail";
import SeriesDetail from "./pages/SeriesDetail";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
