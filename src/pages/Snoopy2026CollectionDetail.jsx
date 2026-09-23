import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { snoopy2026Series } from "../data/snoopy2026Cards";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "../styles/collection-detail.css";

const COLLECTION_ID = "snoopy-un-anno-da-ricordare-2026";
const COLLECTION_LOGO = "/loghi/peanuts-un-anno-da-ricordare.webp";

const Snoopy2026CollectionDetail = () => {
  const { user, authLoading } = useAuth();
  const [seriesStats, setSeriesStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      if (authLoading) return;
      if (!user) {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      setError("");

      try {
        const cardsRef = collection(db, "users", user.uid, "cards");
        const cardsQuery = query(
          cardsRef,
          where("collectionId", "==", COLLECTION_ID),
          where("owned", "==", true),
        );
        const snapshot = await getDocs(cardsQuery);
        const nextStats = Object.fromEntries(
          snoopy2026Series.map((series) => [
            series.id,
            { owned: 0, duplicates: 0 },
          ]),
        );

        snapshot.docs.forEach((document) => {
          const data = document.data();
          if (!nextStats[data.seriesId]) return;
          nextStats[data.seriesId].owned += 1;
          nextStats[data.seriesId].duplicates += data.duplicates || 0;
        });

        setSeriesStats(nextStats);
      } catch (loadError) {
        console.error(loadError);
        setError("Non riesco a caricare i progressi della collezione.");
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [authLoading, user]);

  const totals = useMemo(() => {
    return snoopy2026Series.reduce(
      (result, series) => {
        const stats = seriesStats[series.id] || { owned: 0, duplicates: 0 };
        result.owned += stats.owned;
        result.duplicates += stats.duplicates;
        result.total += series.totalCards;
        return result;
      },
      { owned: 0, duplicates: 0, total: 0 },
    );
  }, [seriesStats]);

  if (authLoading) {
    return (
      <section className="collection-detail">
        <div className="page-heading">
          <p className="eyebrow">Caricamento</p>
          <h1>Controllo accesso...</h1>
        </div>
      </section>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <section className="collection-detail">
      <div className="page-heading">
        <p className="eyebrow">Collezione</p>
        <h1>Snoopy - Un anno da ricordare 2026</h1>
        <p>
          Gestisci le 276 figurine dell'album e le 10 Card Limited Edition
          Cutout Memories.
        </p>
        {error && <p className="collection-error">{error}</p>}
        {statsLoading && (
          <p className="collection-loading">Caricamento progressi...</p>
        )}
      </div>

      <div className="collection-summary">
        <div>
          <strong>{totals.owned}</strong>
          <span>Possedute</span>
        </div>
        <div>
          <strong>{totals.total - totals.owned}</strong>
          <span>Mancanti</span>
        </div>
        <div>
          <strong>{totals.duplicates}</strong>
          <span>Doppie</span>
        </div>
      </div>

      <div className="series-grid">
        {snoopy2026Series.map((series) => {
          const stats = seriesStats[series.id] || { owned: 0, duplicates: 0 };
          const progress = (stats.owned / series.totalCards) * 100;

          return (
            <Link
              to={`/collezioni/${COLLECTION_ID}/${series.id}`}
              className="series-card"
              key={series.id}
            >
              <div className="series-album-cover">
                <img
                  src={COLLECTION_LOGO}
                  alt={series.name}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div>
                <p className="series-label">{series.subtitle}</p>
                <h2>{series.name}</h2>
              </div>

              <div className="series-counter">
                <strong>
                  {stats.owned}/{series.totalCards}
                </strong>
                <span>elementi posseduti</span>
                <span>{stats.duplicates} doppie</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Snoopy2026CollectionDetail;
