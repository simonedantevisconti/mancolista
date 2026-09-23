import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { generateSquishyDumplingCards } from "../data/collections";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { exportCollectionPng } from "../utils/exportCollectionPng";

import "../styles/series-detail.css";

const COLLECTION_ID = "squishy-dumpling";
const SERIES_ID = "base";

const rarityLabels = {
  "da-verificare": "Da verificare",
  rare: "Rare",
  "ultra-rare": "Ultra Rare",
  "rare-mystery": "Rare Mystery",
  "rare-crystal": "Rare Crystal",
};

const SquishyDumplingDetail = () => {
  const { user, authLoading } = useAuth();

  const [cardsStatus, setCardsStatus] = useState({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");

  const cards = useMemo(() => {
    return generateSquishyDumplingCards();
  }, []);

  const ownedCount = Object.values(cardsStatus).filter((card) => {
    return card.owned;
  }).length;

  const duplicatesCount = Object.values(cardsStatus).reduce((total, card) => {
    return total + (card.duplicates || 0);
  }, 0);

  const missingCount = cards.length - ownedCount;

  const getCardDocId = (cardId) => {
    return `${COLLECTION_ID}_${cardId}`;
  };

  const getCardRef = (cardId) => {
    const cardDocId = getCardDocId(cardId);
    return doc(db, "users", user.uid, "cards", cardDocId);
  };

  const buildCardFirestoreData = (card, extraData = {}) => {
    return {
      collectionId: COLLECTION_ID,
      seriesId: SERIES_ID,
      cardId: card.id,
      cardNumber: card.number,
      cardName: card.name,
      rarity: card.rarity,
      ...extraData,
      updatedAt: serverTimestamp(),
    };
  };

  useEffect(() => {
    const loadCardsStatus = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setCardsLoading(false);
        return;
      }

      setCardsLoading(true);
      setError("");

      try {
        const cardsRef = collection(db, "users", user.uid, "cards");
        const cardsQuery = query(
          cardsRef,
          where("collectionId", "==", COLLECTION_ID),
        );
        const snapshot = await getDocs(cardsQuery);
        const savedCardsStatus = {};

        snapshot.docs.forEach((document) => {
          const cardData = document.data();

          if (!cardData.cardId) {
            return;
          }

          savedCardsStatus[cardData.cardId] = {
            owned: Boolean(cardData.owned),
            duplicates: cardData.duplicates || 0,
          };
        });

        setCardsStatus(savedCardsStatus);
      } catch (error) {
        console.error(error);
        setError("Non riesco a caricare le carte salvate.");
      } finally {
        setCardsLoading(false);
      }
    };

    loadCardsStatus();
  }, [authLoading, user]);

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

  const handleExportPng = async () => {
    if (!user || cardsLoading || exportLoading) {
      return;
    }

    setExportLoading(true);
    setError("");

    try {
      await exportCollectionPng({
        collectionName: "Squishy Dumpling",
        seriesName: "Squishy Dumpling",
        cards,
        cardsStatus,
      });
    } catch (error) {
      console.error("Errore esportazione PNG:", error);
      setError("Non riesco a generare la MancoLista. Riprova.");
    } finally {
      setExportLoading(false);
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

  return (
    <section className="series-detail">
      <div className="series-topbar">
        <div>
          <Link className="back-link" to="/">
            ← Torna alle collezioni
          </Link>

          <p className="eyebrow">Collezione</p>
          <h1>Squishy Dumpling</h1>
          <p>
            Segna le carte che hai, controlla quelle mancanti e indica quante
            doppie possiedi.
          </p>

          <div className="pdf-export-actions">
            <button
              type="button"
              className="export-pdf-button"
              onClick={handleExportPng}
              disabled={cardsLoading || exportLoading}
            >
              {exportLoading
                ? "Generazione MancoLista..."
                : "Esporta MancoLista"}
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
            <option value="da-verificare">Da verificare</option>
            <option value="rare">Rare</option>
            <option value="ultra-rare">Ultra Rare</option>
            <option value="rare-mystery">Rare Mystery</option>
            <option value="rare-crystal">Rare Crystal</option>
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

                <span className="card-rarity">
                  {rarityLabels[card.rarity] || card.rarity}
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

export default SquishyDumplingDetail;
