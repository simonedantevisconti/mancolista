import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { mainCollections } from "../data/collections";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "../styles/favourites.css";

const Favourites = () => {
  const { user, authLoading } = useAuth();

  const [collectionStats, setCollectionStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFavouritesStats = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      setError("");

      try {
        const cardsRef = collection(db, "users", user.uid, "cards");

        const cardsQuery = query(cardsRef, where("owned", "==", true));

        const snapshot = await getDocs(cardsQuery);

        const nextCollectionStats = {};

        snapshot.docs.forEach((document) => {
          const cardData = document.data();
          const currentCollectionId = cardData.collectionId;

          if (!currentCollectionId) {
            return;
          }

          if (!nextCollectionStats[currentCollectionId]) {
            nextCollectionStats[currentCollectionId] = {
              owned: 0,
              duplicates: 0,
            };
          }

          nextCollectionStats[currentCollectionId].owned += 1;
          nextCollectionStats[currentCollectionId].duplicates +=
            cardData.duplicates || 0;
        });

        setCollectionStats(nextCollectionStats);
      } catch (error) {
        console.error(error);
        setError("Non riesco a caricare le tue collezioni.");
      } finally {
        setStatsLoading(false);
      }
    };

    loadFavouritesStats();
  }, [authLoading, user]);

  const startedCollections = useMemo(() => {
    return mainCollections
      .map((collection) => {
        const stats = collectionStats[collection.id];

        if (!stats) {
          return null;
        }

        return {
          ...collection,
          owned: stats.owned,
          duplicates: stats.duplicates,
          missing:
            collection.totalCards > 0
              ? Math.max(collection.totalCards - stats.owned, 0)
              : null,
        };
      })
      .filter(Boolean);
  }, [collectionStats]);

  if (authLoading) {
    return (
      <section className="favourites-page">
        <div className="page-heading">
          <p className="eyebrow">Archivio personale</p>
          <h1>Caricamento...</h1>
          <p>Stiamo verificando la tua sessione.</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="favourites-page">
      <div className="page-heading">
        <p className="eyebrow">Archivio personale</p>
        <h1>Le mie collezioni</h1>
        <p>
          Qui vedrai solo le collezioni che hai iniziato davvero a completare.
        </p>

        {statsLoading && (
          <p className="favourites-loading">Caricamento collezioni...</p>
        )}

        {error && <p className="favourites-error">{error}</p>}
      </div>

      {!statsLoading && startedCollections.length === 0 && (
        <div className="empty-collections">
          <h2>Nessuna collezione iniziata</h2>
          <p>
            Apri una collezione e segna almeno una carta per vederla comparire
            qui.
          </p>

          <Link to="/collezioni/italian-brainrot">Inizia Italian Brainrot</Link>
        </div>
      )}

      {!statsLoading && startedCollections.length > 0 && (
        <div className="my-collections-list">
          {startedCollections.map((collection) => {
            return (
              <article className="my-collection-card" key={collection.id}>
                <h2>{collection.name}</h2>

                <div className="stats-grid">
                  <div>
                    <strong>{collection.owned}</strong>
                    <span>Possedute</span>
                  </div>

                  <div>
                    <strong>{collection.duplicates}</strong>
                    <span>Doppie</span>
                  </div>

                  <div>
                    <strong>
                      {collection.missing === null ? "-" : collection.missing}
                    </strong>
                    <span>Mancanti</span>
                  </div>
                </div>

                <Link
                  className="manage-collection-button"
                  to={`/collezioni/${collection.id}`}
                >
                  Gestisci lista
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Favourites;
