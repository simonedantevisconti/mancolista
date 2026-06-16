import { Link, useParams } from "react-router-dom";
import { italianBrainrotSeries, mainCollections } from "../data/collections";
import "../styles/collection-detail.css";

const CollectionDetail = () => {
  const { collectionId } = useParams();

  const collection = mainCollections.find((item) => item.id === collectionId);

  if (!collection || collection.id !== "italian-brainrot") {
    return (
      <section className="collection-detail">
        <h1>Collezione non disponibile</h1>
        <Link to="/">Torna alla homepage</Link>
      </section>
    );
  }

  return (
    <section className="collection-detail">
      <div className="page-heading">
        <p className="eyebrow">Collezione</p>
        <h1>{collection.name}</h1>
        <p>
          Scegli una serie e inizia a segnare le carte che possiedi e quelle che
          ti mancano.
        </p>
      </div>

      <div className="series-grid">
        {italianBrainrotSeries.map((series) => (
          <Link
            to={`/collezioni/${collection.id}/${series.id}`}
            className="series-card"
            key={series.id}
          >
            <div>
              <p className="series-label">{series.name}</p>
              <h2>{series.subtitle}</h2>
            </div>

            <div className="series-counter">
              <strong>
                {series.ownedCards}/{series.totalCards}
              </strong>
              <span>carte possedute</span>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "0%" }} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CollectionDetail;
