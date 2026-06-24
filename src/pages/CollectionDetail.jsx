import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { italianBrainrotSeries, mainCollections } from "../data/collections";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../styles/collection-detail.css";

const CollectionDetail = () => {
  const { collectionId } = useParams();
  const { user, authLoading } = useAuth();

  const [seriesStats, setSeriesStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  const collectionData = mainCollections.find((item) => {
    return item.id === collectionId;
  });

  const collectionTotals = useMemo(() => {
    return italianBrainrotSeries.reduce(
      (totals, series) => {
        const stats = seriesStats[series.id] || {
          owned: 0,
          duplicates: 0,
        };

        return {
          owned: totals.owned + stats.owned,
          duplicates: totals.duplicates + stats.duplicates,
          total: totals.total + series.totalCards,
        };
      },
      {
        owned: 0,
        duplicates: 0,
        total: 0,
      },
    );
  }, [seriesStats]);

  useEffect(() => {
    const loadCollectionStats = async () => {
      if (authLoading) {
        return;
      }

      if (!user || collectionId !== "italian-brainrot") {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      setError("");

      try {
        const cardsRef = collection(db, "users", user.uid, "cards");

        const cardsQuery = query(
          cardsRef,
          where("collectionId", "==", collectionId),
          where("owned", "==", true),
        );

        const snapshot = await getDocs(cardsQuery);

        const nextSeriesStats = {};

        italianBrainrotSeries.forEach((series) => {
          nextSeriesStats[series.id] = {
            owned: 0,
            duplicates: 0,
          };
        });

        snapshot.docs.forEach((document) => {
          const cardData = document.data();

          if (!nextSeriesStats[cardData.seriesId]) {
            return;
          }

          nextSeriesStats[cardData.seriesId].owned += 1;
          nextSeriesStats[cardData.seriesId].duplicates +=
            cardData.duplicates || 0;
        });

        setSeriesStats(nextSeriesStats);
      } catch (error) {
        console.error(error);
        setError("Non riesco a caricare i progressi della collezione.");
      } finally {
        setStatsLoading(false);
      }
    };

    loadCollectionStats();
  }, [authLoading, user, collectionId]);

  if (authLoading) {
    return (
      <section className="collection-detail">
        <div className="page-heading">
          <p className="eyebrow">Caricamento</p>
          <h1>Controllo accesso...</h1>
          <p>Stiamo verificando la tua sessione.</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!collectionData || collectionData.id !== "italian-brainrot") {
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
        <h1>{collectionData.name}</h1>
        <p>
          Scegli una serie e continua a segnare le carte che possiedi, quelle
          mancanti e le doppie.
        </p>

        {error && <p className="collection-error">{error}</p>}
        {statsLoading && (
          <p className="collection-loading">Caricamento progressi...</p>
        )}
      </div>

      <div className="collection-summary">
        <div>
          <strong>{collectionTotals.owned}</strong>
          <span>Possedute</span>
        </div>

        <div>
          <strong>{collectionTotals.total - collectionTotals.owned}</strong>
          <span>Mancanti</span>
        </div>

        <div>
          <strong>{collectionTotals.duplicates}</strong>
          <span>Doppie</span>
        </div>
      </div>

      <div className="series-grid">
        {italianBrainrotSeries.map((series) => {
          const stats = seriesStats[series.id] || {
            owned: 0,
            duplicates: 0,
          };

          const progress =
            series.totalCards > 0 ? (stats.owned / series.totalCards) * 100 : 0;

          return (
            <Link
              to={`/collezioni/${collectionData.id}/${series.id}`}
              className="series-card"
              key={series.id}
            >
              <div>
                <p className="series-label">{series.name}</p>
                <h2>{series.subtitle}</h2>
              </div>

              <div className="series-counter">
                <strong>
                  {stats.owned}/{series.totalCards}
                </strong>
                <span>carte possedute</span>
                <span>{stats.duplicates} doppie</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CollectionDetail;
