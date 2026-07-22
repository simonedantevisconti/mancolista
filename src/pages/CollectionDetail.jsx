import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { italianBrainrotSeries, mainCollections } from "../data/collections";
import { collectionProviders } from "../data/collectionProviders";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "../styles/collection-detail.css";

const seriesAlbumImages = {
  alpha: "/album/universo-psichedelico-album.jpg",
  beta: "/album/allucinazione-cosmica-album.png",
  gamma: "/album/anomalia-galattica-album.jpg",
};

const CollectionDetail = () => {
  const { collectionId } = useParams();
  const { user, authLoading } = useAuth();

  const [seriesStats, setSeriesStats] = useState({});
  const [remoteSets, setRemoteSets] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const collectionData = mainCollections.find((item) => {
    return item.id === collectionId;
  });

  const isStaticBrainrot = collectionData?.provider === "italian-brainrot";
  const remoteProvider = collectionData?.provider
    ? collectionProviders[collectionData.provider]
    : null;

  const collectionTotals = useMemo(() => {
    if (!isStaticBrainrot) {
      return {
        owned: 0,
        duplicates: 0,
        total: 0,
      };
    }

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
  }, [isStaticBrainrot, seriesStats]);

  const filteredRemoteSets = remoteSets.filter((set) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return set.name.toLowerCase().includes(normalizedSearch);
  });

  useEffect(() => {
    const loadStaticCollectionStats = async () => {
      if (authLoading) {
        return;
      }

      if (!user || !isStaticBrainrot) {
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

    loadStaticCollectionStats();
  }, [authLoading, user, collectionId, isStaticBrainrot]);

  useEffect(() => {
    const loadRemoteSets = async () => {
      if (authLoading) {
        return;
      }

      if (!user || !remoteProvider) {
        return;
      }

      setRemoteLoading(true);
      setError("");

      try {
        const sets = await remoteProvider.getSets();
        setRemoteSets(sets);
      } catch (error) {
        console.error(error);
        setError("Non riesco a caricare le espansioni di questa collezione.");
      } finally {
        setRemoteLoading(false);
      }
    };

    loadRemoteSets();
  }, [authLoading, user, remoteProvider]);

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

  if (!collectionData || !collectionData.active) {
    return (
      <section className="collection-detail">
        <h1>Collezione non disponibile</h1>
        <Link to="/">Torna alla homepage</Link>
      </section>
    );
  }

  if (remoteProvider) {
    return (
      <section className="collection-detail">
        <div className="page-heading">
          <p className="eyebrow">{remoteProvider.label}</p>
          <h1>{collectionData.name}</h1>
          <p>{collectionData.description}</p>

          {error && <p className="collection-error">{error}</p>}
          {remoteLoading && (
            <p className="collection-loading">Caricamento espansioni...</p>
          )}
        </div>

        <div className="series-filters collection-set-filters">
          <div className="search-field">
            <label htmlFor="set-search">Cerca espansione</label>
            <input
              id="set-search"
              type="search"
              placeholder="Cerca set..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-result">
            <strong>{filteredRemoteSets.length}</strong>
            <span>set</span>
          </div>
        </div>

        {!remoteLoading && filteredRemoteSets.length === 0 && (
          <div className="empty-cards-message">
            <h2>Nessuna espansione trovata</h2>
            <p>Prova a cambiare ricerca.</p>
          </div>
        )}

        <div className="series-grid">
          {filteredRemoteSets.map((set) => {
            return (
              <Link
                to={`/collezioni/${collectionData.id}/${set.id}`}
                className="series-card"
                key={set.id}
              >
                <div className="series-album-cover series-album-cover--contain">
                  <img
                    src={set.cover}
                    alt={set.name}
                    onError={(event) => {
                      if (set.logo && event.currentTarget.src !== set.logo) {
                        event.currentTarget.src = set.logo;
                        return;
                      }

                      event.currentTarget.style.display = "none";
                      event.currentTarget.nextElementSibling.style.display =
                        "grid";
                    }}
                  />

                  <div className="collection-placeholder collection-placeholder--hidden">
                    {collectionData.name}
                  </div>
                </div>

                <div>
                  <p className="series-label">Espansione</p>
                  <h2>{set.name}</h2>
                </div>

                <div className="series-counter">
                  <strong>{set.cardCount || "?"}</strong>
                  <span>carte totali</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  if (!isStaticBrainrot) {
    return (
      <section className="collection-detail">
        <h1>Collezione non configurata</h1>
        <p>
          Questa collezione è attiva ma non ha ancora un provider collegato.
        </p>
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
              <div className="series-album-cover">
                <img
                  src={seriesAlbumImages[series.id]}
                  alt={`Album ${series.name}`}
                />
              </div>

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
