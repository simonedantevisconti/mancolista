import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";

import { disneyLorcanaCollections } from "../data/disneyLorcanaCards";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

import "../styles/collection-detail.css";

const COLLECTION_ID = "disney-lorcana";
const FALLBACK_IMAGE = "/loghi/disney-logo.png";

const DisneyLorcanaCollectionDetail = () => {
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
          disneyLorcanaCollections.map((series) => [
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
    return disneyLorcanaCollections.reduce(
      (result, series) => {
        const stats = seriesStats[series.id] || { owned: 0, duplicates: 0 };

        result.owned += stats.owned;
        result.duplicates += stats.duplicates;
        result.total += series.totalCards || 0;

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
        <h1>Disney Lorcana</h1>
        <p>
          Scegli una delle 14 espansioni. Le checklist verranno completate una alla
          volta, mantenendo già pronta la struttura di tutta la collezione.
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
          <strong>{Math.max(0, totals.total - totals.owned)}</strong>
          <span>Mancanti schedate</span>
        </div>
        <div>
          <strong>{totals.duplicates}</strong>
          <span>Doppie</span>
        </div>
      </div>

      <div className="series-grid">
        {disneyLorcanaCollections.map((series) => {
          const stats = seriesStats[series.id] || { owned: 0, duplicates: 0 };
          const progress =
            series.totalCards > 0 ? (stats.owned / series.totalCards) * 100 : 0;

          return (
            <Link
              to={`/collezioni/${COLLECTION_ID}/${series.id}`}
              className="series-card"
              key={series.id}
            >
              <div className="series-album-cover">
                <img
                  src={series.coverImage}
                  alt={series.name}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div>
                <p className="series-label">Set {series.setNumber}</p>
                <h2>{series.name}</h2>
                <p className="series-original-name">{series.originalName}</p>
              </div>

              <div className="series-counter">
                {series.configured ? (
                  <>
                    <strong>
                      {stats.owned}/{series.totalCards}
                    </strong>
                    <span>carte possedute</span>
                    <span>{stats.duplicates} doppie</span>
                  </>
                ) : (
                  <>
                    <strong>—</strong>
                    <span>Checklist da configurare</span>
                    <span>Pronta per il prossimo step</span>
                  </>
                )}
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default DisneyLorcanaCollectionDetail;
