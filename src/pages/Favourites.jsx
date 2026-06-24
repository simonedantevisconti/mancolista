import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../styles/favourites.css";

const TOTAL_BRAINROT_CARDS = 450;

const Favourites = () => {
  const { user, authLoading } = useAuth();

  const [collectionStats, setCollectionStats] = useState({
    owned: 0,
    duplicates: 0,
    missing: TOTAL_BRAINROT_CARDS,
  });

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

        const cardsQuery = query(
          cardsRef,
          where("collectionId", "==", "italian-brainrot"),
          where("owned", "==", true),
        );

        const snapshot = await getDocs(cardsQuery);

        let owned = 0;
        let duplicates = 0;

        snapshot.docs.forEach((document) => {
          const cardData = document.data();

          owned += 1;
          duplicates += cardData.duplicates || 0;
        });

        setCollectionStats({
          owned,
          duplicates,
          missing: TOTAL_BRAINROT_CARDS - owned,
        });
      } catch (error) {
        console.error(error);
        setError("Non riesco a caricare le tue collezioni.");
      } finally {
        setStatsLoading(false);
      }
    };

    loadFavouritesStats();
  }, [authLoading, user]);

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

  const hasStartedCollection =
    collectionStats.owned > 0 || collectionStats.duplicates > 0;

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

      {!statsLoading && !hasStartedCollection && (
        <div className="empty-collections">
          <h2>Nessuna collezione iniziata</h2>
          <p>
            Apri una collezione e segna almeno una carta per vederla comparire
            qui.
          </p>

          <Link to="/collezioni/italian-brainrot">Inizia Italian Brainrot</Link>
        </div>
      )}

      {!statsLoading && hasStartedCollection && (
        <div className="my-collections-list">
          <article className="my-collection-card">
            <h2>Italian Brainrot</h2>

            <div className="stats-grid">
              <div>
                <strong>{collectionStats.owned}</strong>
                <span>Possedute</span>
              </div>

              <div>
                <strong>{collectionStats.duplicates}</strong>
                <span>Doppie</span>
              </div>

              <div>
                <strong>{collectionStats.missing}</strong>
                <span>Mancanti</span>
              </div>
            </div>

            <Link
              className="manage-collection-button"
              to="/collezioni/italian-brainrot"
            >
              Gestisci lista
            </Link>
          </article>
        </div>
      )}
    </section>
  );
};

export default Favourites;
