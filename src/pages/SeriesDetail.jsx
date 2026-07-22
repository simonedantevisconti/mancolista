import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  deleteDoc,
  doc,
  getDocs,
  query,
  collection,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  generateBrainrotCards,
  italianBrainrotSeries,
} from "../data/collections";
import {
  getRarityClassName,
  getRarityLabel,
} from "../data/italianBrainrotCards";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "../styles/series-detail.css";
import { exportCollectionPdf } from "../utils/exportCollectionPdf";

const SeriesDetail = () => {
  const { collectionId, seriesId } = useParams();
  const { user, authLoading } = useAuth();
  const [pdfLoadingType, setPdfLoadingType] = useState("");

  const [cardsStatus, setCardsStatus] = useState({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");

  const series = italianBrainrotSeries.find((item) => item.id === seriesId);

  const cards = useMemo(() => {
    return generateBrainrotCards(seriesId);
  }, [seriesId]);

  const buildCardFirestoreData = (card, extraData = {}) => {
    return {
      collectionId,
      seriesId,
      cardId: card.id,
      cardNumber: card.number,
      cardName: card.name,
      rarity: card.rarity,
      ...extraData,
      updatedAt: serverTimestamp(),
    };
  };

  const ownedCount = Object.values(cardsStatus).filter((card) => {
    return card.owned;
  }).length;

  const duplicatesCount = Object.values(cardsStatus).reduce((total, card) => {
    return total + (card.duplicates || 0);
  }, 0);

  const missingCount = cards.length - ownedCount;

  const handleExportPdf = async (exportType) => {
    if (!user || !series || pdfLoadingType) {
      return;
    }

    setPdfLoadingType(exportType);
    setError("");

    try {
      await exportCollectionPdf({
        exportType,
        username: user.displayName || user.email || "Utente MancoLista",
        collectionName: "Italian Brainrot",
        seriesName: `${series.name} - ${series.subtitle}`,
        cards,
        cardsStatus,
      });
    } catch (error) {
      console.error("Errore esportazione PDF:", error);
      setError("Non riesco a generare il PDF. Riprova.");
    } finally {
      setPdfLoadingType("");
    }
  };

  const filteredCards = cards.filter((card) => {
    const cardStatus = cardsStatus[card.id];
    const isOwned = Boolean(cardStatus?.owned);

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 ||
      card.name.toLowerCase().includes(normalizedSearch) ||
      String(card.number).includes(normalizedSearch);

    const matchesRarity =
      rarityFilter === "all" || card.rarity === rarityFilter;

    const matchesOwnership =
      ownershipFilter === "all" ||
      (ownershipFilter === "owned" && isOwned) ||
      (ownershipFilter === "missing" && !isOwned);

    return matchesSearch && matchesRarity && matchesOwnership;
  });

  useEffect(() => {
    const loadCardsStatus = async () => {
      if (authLoading) {
        return;
      }

      if (!user || collectionId !== "italian-brainrot" || !series) {
        setCardsLoading(false);
        return;
      }

      setCardsLoading(true);
      setError("");

      try {
        const cardsRef = collection(db, "users", user.uid, "cards");

        const cardsQuery = query(
          cardsRef,
          where("collectionId", "==", collectionId),
          where("seriesId", "==", seriesId),
        );

        const snapshot = await getDocs(cardsQuery);

        const savedCardsStatus = {};

        const metadataUpdates = [];

        snapshot.docs.forEach((document) => {
          const cardData = document.data();

          const realCard =
            cards.find((card) => card.id === cardData.cardId) ||
            cards.find((card) => card.number === cardData.cardNumber);

          if (!realCard) {
            return;
          }

          savedCardsStatus[realCard.id] = {
            owned: Boolean(cardData.owned),
            duplicates: cardData.duplicates || 0,
          };

          const hasOldMetadata =
            cardData.cardId !== realCard.id ||
            cardData.cardNumber !== realCard.number ||
            cardData.cardName !== realCard.name ||
            cardData.rarity !== realCard.rarity;

          if (hasOldMetadata) {
            const cardRef = doc(db, "users", user.uid, "cards", document.id);

            metadataUpdates.push(
              updateDoc(cardRef, {
                cardId: realCard.id,
                cardNumber: realCard.number,
                cardName: realCard.name,
                rarity: realCard.rarity,
                updatedAt: serverTimestamp(),
              }),
            );
          }
        });

        if (metadataUpdates.length > 0) {
          await Promise.all(metadataUpdates);
        }

        setCardsStatus(savedCardsStatus);
      } catch (error) {
        console.error(error);
        setError("Non riesco a caricare le carte salvate.");
      } finally {
        setCardsLoading(false);
      }
    };

    loadCardsStatus();
  }, [authLoading, user, collectionId, seriesId, series, cards]);

  const getCardDocId = (cardId) => {
    return `${collectionId}_${seriesId}_${cardId}`;
  };

  const getCardRef = (cardId) => {
    const cardDocId = getCardDocId(cardId);
    return doc(db, "users", user.uid, "cards", cardDocId);
  };

  const toggleCard = async (card) => {
    if (!user) {
      return;
    }

    const currentStatus = cardsStatus[card.id];
    const isOwned = Boolean(currentStatus?.owned);
    const cardRef = getCardRef(card.id);

    setSavingCardId(card.id);
    setError("");

    try {
      if (isOwned) {
        await deleteDoc(cardRef);

        setCardsStatus((currentCardsStatus) => {
          const updatedCardsStatus = { ...currentCardsStatus };
          delete updatedCardsStatus[card.id];
          return updatedCardsStatus;
        });

        return;
      }

      await setDoc(
        cardRef,
        buildCardFirestoreData(card, {
          owned: true,
          duplicates: 0,
          createdAt: serverTimestamp(),
        }),
        { merge: true },
      );

      setCardsStatus((currentCardsStatus) => {
        return {
          ...currentCardsStatus,
          [card.id]: {
            owned: true,
            duplicates: 0,
          },
        };
      });
    } catch (error) {
      console.error(error);
      setError("Non riesco a salvare questa carta. Riprova.");
    } finally {
      setSavingCardId("");
    }
  };

  const addDuplicate = async (card) => {
    if (!user) {
      return;
    }

    const currentStatus = cardsStatus[card.id];
    const currentDuplicates = currentStatus?.duplicates || 0;
    const nextDuplicates = currentDuplicates + 1;
    const cardRef = getCardRef(card.id);

    setSavingCardId(card.id);
    setError("");

    try {
      await setDoc(
        cardRef,
        buildCardFirestoreData(card, {
          owned: true,
          duplicates: nextDuplicates,
          createdAt: serverTimestamp(),
        }),
        { merge: true },
      );

      setCardsStatus((currentCardsStatus) => {
        return {
          ...currentCardsStatus,
          [card.id]: {
            owned: true,
            duplicates: nextDuplicates,
          },
        };
      });
    } catch (error) {
      console.error(error);
      setError("Non riesco ad aggiungere la doppia. Riprova.");
    } finally {
      setSavingCardId("");
    }
  };

  const removeDuplicate = async (card) => {
    if (!user) {
      return;
    }

    const currentStatus = cardsStatus[card.id];
    const currentDuplicates = currentStatus?.duplicates || 0;

    if (currentDuplicates <= 0) {
      return;
    }

    const nextDuplicates = currentDuplicates - 1;
    const cardRef = getCardRef(card.id);

    setSavingCardId(card.id);
    setError("");

    try {
      await updateDoc(cardRef, {
        cardNumber: card.number,
        cardName: card.name,
        rarity: card.rarity,
        duplicates: nextDuplicates,
        updatedAt: serverTimestamp(),
      });

      setCardsStatus((currentCardsStatus) => {
        return {
          ...currentCardsStatus,
          [card.id]: {
            owned: true,
            duplicates: nextDuplicates,
          },
        };
      });
    } catch (error) {
      console.error(error);
      setError("Non riesco a rimuovere la doppia. Riprova.");
    } finally {
      setSavingCardId("");
    }
  };

  if (authLoading) {
    return (
      <section className="series-detail">
        <p className="eyebrow">Caricamento</p>
        <h1>Controllo accesso...</h1>
        <p>Stiamo verificando la tua sessione.</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (collectionId !== "italian-brainrot" || !series) {
    return (
      <section className="series-detail">
        <h1>Serie non disponibile</h1>
        <Link to="/">Torna alla homepage</Link>
      </section>
    );
  }

  return (
    <section className="series-detail">
      <div className="series-topbar">
        <div>
          <Link className="back-link" to="/collezioni/italian-brainrot">
            ← Torna alle serie
          </Link>

          <p className="eyebrow">{series.name}</p>
          <h1>{series.subtitle}</h1>
          <p>
            Segna le carte che hai. Le carte possedute mostrano il fronte,
            quelle mancanti mostrano il retro. Puoi anche indicare quante doppie
            hai per ogni carta.
          </p>

          <div className="pdf-export-actions">
            <button
              type="button"
              className="export-pdf-button"
              onClick={() => handleExportPdf("missing")}
              disabled={cardsLoading || Boolean(pdfLoadingType)}
            >
              {pdfLoadingType === "missing"
                ? "Generazione MancoLista..."
                : "Esporta MancoLista"}
            </button>

            <button
              type="button"
              className="export-pdf-button export-pdf-button--secondary"
              onClick={() => handleExportPdf("duplicates")}
              disabled={cardsLoading || Boolean(pdfLoadingType)}
            >
              {pdfLoadingType === "duplicates"
                ? "Generazione lista doppie..."
                : "Esporta lista doppie"}
            </button>
          </div>

          {error && <p className="series-error">{error}</p>}
          {cardsLoading && (
            <p className="series-loading">Caricamento carte...</p>
          )}
        </div>

        <div className="series-stats">
          <div>
            <strong>{ownedCount}</strong>
            <span>Possedute</span>
          </div>

          <div>
            <strong>{missingCount}</strong>
            <span>Mancanti</span>
          </div>

          <div>
            <strong>{duplicatesCount}</strong>
            <span>Doppie</span>
          </div>
        </div>
      </div>

      <div className="series-filters">
        <div className="search-field">
          <label htmlFor="card-search">Cerca carta</label>
          <input
            id="card-search"
            type="search"
            placeholder="Cerca per nome o numero..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="rarity-filter">Rarità</label>
          <select
            id="rarity-filter"
            value={rarityFilter}
            onChange={(event) => setRarityFilter(event.target.value)}
          >
            <option value="all">Tutte</option>
            <option value="niente-di-che">Niente di che</option>
            <option value="cosi-cosi">Così così</option>
            <option value="bella">Bella</option>
            <option value="fighissima">Fighissima</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="ownership-filter">Stato</label>
          <select
            id="ownership-filter"
            value={ownershipFilter}
            onChange={(event) => setOwnershipFilter(event.target.value)}
          >
            <option value="all">Tutte</option>
            <option value="owned">Possedute</option>
            <option value="missing">Mancanti</option>
          </select>
        </div>

        <div className="filter-result">
          <strong>{filteredCards.length}</strong>
          <span>risultati</span>
        </div>
      </div>

      {filteredCards.length === 0 && (
        <div className="empty-cards-message">
          <h2>Nessuna carta trovata</h2>
          <p>Prova a cambiare ricerca, rarità o stato della carta.</p>
        </div>
      )}

      <div className="cards-grid">
        {filteredCards.map((card) => {
          const cardStatus = cardsStatus[card.id];
          const isOwned = Boolean(cardStatus?.owned);
          const duplicates = cardStatus?.duplicates || 0;
          const isSaving = savingCardId === card.id;

          return (
            <article
              className={`brainrot-card ${isOwned ? "is-owned" : ""}`}
              key={card.id}
            >
              <button
                className="card-image-button"
                type="button"
                onClick={() => toggleCard(card)}
                disabled={cardsLoading || isSaving}
                aria-label={`Segna ${card.name}`}
              >
                <div className="card-flip">
                  <div className="card-face card-back">
                    <img
                      src={card.backImage}
                      alt={`Retro ${card.name}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="card-face card-front">
                    <img
                      src={card.frontImage}
                      alt={card.name}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </button>

              <div className="brainrot-card-info">
                <span className="card-number">
                  #{String(card.number).padStart(3, "0")}
                </span>

                <h2>{card.name}</h2>
                <span
                  className={`card-rarity rarity-${getRarityClassName(card.rarity)}`}
                >
                  {getRarityLabel(card.rarity)}
                </span>

                <label className="owned-toggle">
                  <input
                    type="checkbox"
                    checked={isOwned}
                    disabled={cardsLoading || isSaving}
                    onChange={() => toggleCard(card)}
                  />
                  <span>
                    {isSaving
                      ? "Salvataggio..."
                      : isOwned
                        ? "Ce l'ho"
                        : "Mi manca"}
                  </span>
                </label>

                {isOwned && (
                  <div className="duplicates-control">
                    <span>Doppie</span>

                    <div className="duplicates-actions">
                      <button
                        type="button"
                        onClick={() => removeDuplicate(card)}
                        disabled={cardsLoading || isSaving || duplicates === 0}
                      >
                        -
                      </button>

                      <strong>{duplicates}</strong>

                      <button
                        type="button"
                        onClick={() => addDuplicate(card)}
                        disabled={cardsLoading || isSaving}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default SeriesDetail;
