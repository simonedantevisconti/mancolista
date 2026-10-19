import { Link, useParams } from "react-router-dom";

import { disneyLorcanaCollections } from "../data/disneyLorcanaCards";
import DisneyLorcanaDetail from "./DisneyLorcanaDetail";
import DisneyLorcanaRiseFloodbornDetail from "./DisneyLorcanaRiseFloodbornDetail";
import DisneyLorcanaIntoInklandsDetail from "./DisneyLorcanaIntoInklandsDetail";
import DisneyLorcanaUrsulasReturnDetail from "./DisneyLorcanaUrsulasReturnDetail";
import DisneyLorcanaShimmeringSkiesDetail from "./DisneyLorcanaShimmeringSkiesDetail";
import DisneyLorcanaAzuriteSeaDetail from "./DisneyLorcanaAzuriteSeaDetail";
import DisneyLorcanaArchaziasIslandDetail from "./DisneyLorcanaArchaziasIslandDetail";
import DisneyLorcanaReignOfJafarDetail from "./DisneyLorcanaReignOfJafarDetail";

import "../styles/series-detail.css";

const DisneyLorcanaSeriesDetail = () => {
  const { seriesId } = useParams();

  const series = disneyLorcanaCollections.find((item) => item.id === seriesId);

  if (!series) {
    return (
      <section className="series-detail">
        <h1>Espansione non disponibile</h1>
        <Link className="back-link" to="/collezioni/disney-lorcana">
          ← Torna alle espansioni
        </Link>
      </section>
    );
  }

  if (series.id === "the-first-chapter") {
    return <DisneyLorcanaDetail />;
  }

  if (series.id === "rise-of-the-floodborn") {
    return <DisneyLorcanaRiseFloodbornDetail />;
  }

  if (series.id === "into-the-inklands") {
    return <DisneyLorcanaIntoInklandsDetail />;
  }

  if (series.id === "ursulas-return") {
    return <DisneyLorcanaUrsulasReturnDetail />;
  }

  if (series.id === "shimmering-skies") {
    return <DisneyLorcanaShimmeringSkiesDetail />;
  }

  if (series.id === "azurite-sea") {
    return <DisneyLorcanaAzuriteSeaDetail />;
  }

  if (series.id === "archazias-island") {
    return <DisneyLorcanaArchaziasIslandDetail />;
  }

  if (series.id === "reign-of-jafar") {
    return <DisneyLorcanaReignOfJafarDetail />;
  }

  return (
    <section className="series-detail">
      <Link className="back-link" to="/collezioni/disney-lorcana">
        ← Torna alle espansioni
      </Link>

      <p className="eyebrow">Disney Lorcana · Set {series.setNumber}</p>
      <h1>{series.name}</h1>
      <p>{series.originalName}</p>

      <div className="empty-cards-message">
        <h2>Checklist in preparazione</h2>
        <p>
          L'espansione è già configurata nella raccolta. La checklist delle carte
          verrà aggiunta nel prossimo passaggio.
        </p>
      </div>
    </section>
  );
};

export default DisneyLorcanaSeriesDetail;
