import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { mainCollections } from "../data/collections";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "../styles/homepage.css";

const Homepage = () => {
  const [search, setSearch] = useState("");
  const [collectionStats, setCollectionStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    const loadHomepageStats = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setCollectionStats({});
        return;
      }

      setStatsLoading(true);

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
        console.error("Errore caricamento statistiche homepage:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadHomepageStats();
  }, [authLoading, user]);

  const collectionsWithStats = useMemo(() => {
    return mainCollections.map((collection) => {
      const stats = collectionStats[collection.id] || {
        owned: collection.ownedCards,
        duplicates: 0,
      };

      return {
        ...collection,
        ownedCards: stats.owned,
        duplicates: stats.duplicates,
      };
    });
  }, [collectionStats]);

  const filteredCollections = collectionsWithStats.filter((collection) =>
    collection.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenCollection = (collection) => {
    if (!collection.active) {
      return;
    }

    navigate(`/collezioni/${collection.id}`);
  };

  return (
    <section className="homepage">
      <div className="homepage-hero">
        <p className="eyebrow">La tua checklist digitale</p>
        <h1>MancoLista</h1>
        <p>
          Organizza le tue collezioni, segna le carte che hai, controlla le
          doppie e scopri quelle che ti mancano.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Cerca una collezione..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {statsLoading && (
          <p className="homepage-loading">Aggiornamento progressi...</p>
        )}
      </div>

      <div className="collections-grid">
        {filteredCollections.map((collection) => {
          const progress =
            collection.totalCards > 0
              ? (collection.ownedCards / collection.totalCards) * 100
              : 0;

          return (
            <article
              className={`collection-card ${
                !collection.active ? "collection-card--disabled" : ""
              }`}
              key={collection.id}
            >
              <div className="collection-logo">
                <img src={collection.logo} alt={`Logo ${collection.name}`} />
              </div>

              <div>
                <h2>{collection.name}</h2>
                <p>{collection.description}</p>
              </div>

              <div className="collection-progress">
                <span>
                  {collection.ownedCards}
                  {collection.totalCards > 0
                    ? `/${collection.totalCards} carte`
                    : " carte segnate"}
                </span>

                {collection.active && (
                  <span>{collection.duplicates} doppie</span>
                )}

                {collection.totalCards > 0 && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                className="card-button"
                type="button"
                onClick={() => handleOpenCollection(collection)}
                disabled={!collection.active}
              >
                {collection.active ? "Apri collezione" : "Presto disponibile"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Homepage;
