import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  if (authLoading) {
    return (
      <section className="homepage homepage--loading">
        <p>Caricamento MancoLista...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="public-homepage">
        <div className="public-hero">
          <div className="public-hero__content">
            <p className="eyebrow">La tua checklist digitale</p>
            <h1>Tieni sotto controllo la tua collezione.</h1>
            <p className="public-hero__lead">
              MancoLista ti aiuta a segnare ciò che possiedi, vedere subito cosa
              ti manca e tenere traccia delle doppie in modo semplice e veloce.
            </p>

            <div className="public-hero__actions">
              <Link className="public-button public-button--primary" to="/login?mode=signup">
                Crea il tuo account
              </Link>
              <Link className="public-button public-button--secondary" to="/login">
                Accedi
              </Link>
            </div>

            <p className="public-hero__note">
              Registrazione gratuita. Le tue collezioni restano salvate nel tuo account.
            </p>
          </div>

          <div className="public-preview" aria-label="Anteprima MancoLista">
            <div className="public-preview__top">
              <span>MancoLista</span>
              <span>Italian Brainrot</span>
            </div>

            <div className="public-preview__stats">
              <div>
                <strong>87</strong>
                <span>Possedute</span>
              </div>
              <div>
                <strong>63</strong>
                <span>Mancanti</span>
              </div>
              <div>
                <strong>14</strong>
                <span>Doppie</span>
              </div>
            </div>

            <div className="public-preview__progress">
              <span style={{ width: "58%" }} />
            </div>
          </div>
        </div>

        <div className="public-section">
          <div className="public-section__heading">
            <p className="eyebrow">Come funziona</p>
            <h2>Tre passaggi. Nessun foglio da aggiornare.</h2>
          </div>

          <div className="public-steps">
            <article>
              <span>01</span>
              <h3>Scegli la collezione</h3>
              <p>Apri la serie che stai completando e visualizza tutte le carte.</p>
            </article>

            <article>
              <span>02</span>
              <h3>Segna le tue carte</h3>
              <p>Indica con un tocco quali possiedi e quante doppie hai.</p>
            </article>

            <article>
              <span>03</span>
              <h3>Condividi le liste</h3>
              <p>Esporta mancanti e doppie in PNG, pronti da inviare o condividere.</p>
            </article>
          </div>
        </div>

        <div className="public-benefits">
          <div>
            <p className="eyebrow">Sempre con te</p>
            <h2>La tua collezione anche dal telefono.</h2>
          </div>

          <div className="public-benefits__list">
            <p><strong>Progressi salvati</strong><span>Accedi da qualsiasi dispositivo e ritrova tutto aggiornato.</span></p>
            <p><strong>Mancanti e doppie</strong><span>Controlla subito cosa cercare e cosa puoi scambiare.</span></p>
            <p><strong>Installabile come app</strong><span>Aggiungi MancoLista alla schermata Home del telefono.</span></p>
          </div>
        </div>

        <div className="public-cta">
          <p className="eyebrow">Inizia ora</p>
          <h2>La tua MancoLista parte da qui.</h2>
          <p>Crea il tuo account e comincia a organizzare la collezione.</p>
          <Link className="public-button public-button--dark" to="/login?mode=signup">
            Registrati gratis
          </Link>
        </div>
      </section>
    );
  }

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
                <img
                  src={collection.logo}
                  alt={`Logo ${collection.name}`}
                  loading="lazy"
                  decoding="async"
                />
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
                      style={{ width: `${progress}%` }}
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
