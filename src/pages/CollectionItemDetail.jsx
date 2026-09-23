import { Link, useParams } from "react-router-dom";
import { mainCollections } from "../data/collections";
import SeriesDetail from "./SeriesDetail";
import WorldCup2026SeriesDetail from "./WorldCup2026SeriesDetail";

const CollectionItemDetail = () => {
  const { collectionId } = useParams();

  const collectionData = mainCollections.find((collection) => {
    return collection.id === collectionId;
  });

  if (collectionData?.provider === "italian-brainrot") {
    return <SeriesDetail />;
  }

  if (collectionData?.provider === "world-cup-2026") {
    return <WorldCup2026SeriesDetail />;
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
