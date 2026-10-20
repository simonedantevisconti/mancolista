import { Link, useParams } from "react-router-dom";
import { mainCollections } from "../data/collections";
import DisneyLorcanaSeriesDetail from "./DisneyLorcanaSeriesDetail";
import KpopDemonHuntersSeriesDetail from "./KpopDemonHuntersSeriesDetail";
import OnePieceRomanceDawnDetail from "./OnePieceRomanceDawnDetail";
import OnePieceSeriesDetail from "./OnePieceSeriesDetail";
import { onePieceSeries } from "../data/onePieceCards";
import SeriesDetail from "./SeriesDetail";
import Snoopy2026SeriesDetail from "./Snoopy2026SeriesDetail";
import WorldCup2026SeriesDetail from "./WorldCup2026SeriesDetail";

const CollectionItemDetail = () => {
  const { collectionId, seriesId } = useParams();

  const collectionData = mainCollections.find((collection) => {
    return collection.id === collectionId;
  });

  if (collectionData?.provider === "italian-brainrot") {
    return <SeriesDetail />;
  }

  if (collectionData?.provider === "world-cup-2026") {
    return <WorldCup2026SeriesDetail />;
  }

  if (collectionData?.provider === "snoopy-2026") {
    return <Snoopy2026SeriesDetail />;
  }

  if (collectionData?.provider === "kpop-demon-hunters") {
    return <KpopDemonHuntersSeriesDetail />;
  }

  if (collectionData?.provider === "disney-lorcana") {
    return <DisneyLorcanaSeriesDetail />;
  }

  if (collectionData?.provider === "one-piece-card-game") {
    if (seriesId === "romance-dawn") {
      return <OnePieceRomanceDawnDetail />;
    }

    const series = onePieceSeries.find((item) => item.id === seriesId);

    if (series?.configured) {
      return <OnePieceSeriesDetail />;
    }

    return (
      <section className="series-detail">
        <Link className="back-link" to="/collezioni/one-piece-card-game">
          ← Torna alle collezioni
        </Link>
        <p className="eyebrow">{series?.code || "One Piece Card Game"}</p>
        <h1>{series?.name || "Collezione non disponibile"}</h1>
        <p>Questa collezione è pronta e verrà popolata con le carte nel prossimo passaggio.</p>
      </section>
    );
  }

  return (
    <section className="series-detail">
      <h1>Collezione non disponibile</h1>
      <p>Questa collezione non è ancora stata configurata.</p>
      <Link to="/">Torna alla homepage</Link>
    </section>
  );
};

export default CollectionItemDetail;
