import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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

import CustomSelect from "../components/CustomSelect";
import {
  onePieceParamountWarCards,
  onePiecePillarsOfStrengthCards,
  onePieceKingdomsOfIntrigueCards,
  onePieceAwakeningOfTheNewEraCards,
  onePieceWingsOfTheCaptainCards,
  onePiece500YearsInTheFutureCards,
  onePieceTwoLegendsCards,
  onePieceEmperorsInTheNewWorldCards,
  onePieceRoyalBloodCards,
  onePieceAFistOfDivineSpeedCards,
  onePieceLegacyOfTheMasterCards,
  onePieceSeries,
} from "../data/onePieceCards";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { exportCollectionPng } from "../utils/exportCollectionPng";

import "../styles/series-detail.css";

const COLLECTION_ID = "one-piece-card-game";

const rarityLabels = {
  L: "Leader",
  SEC: "Segreta",
  SR: "Super Rara",
  R: "Rara",
  UC: "Non Comune",
  C: "Comune",
  SP: "Speciale",
  TR: "Treasure Rare",
  P: "Promo",
};

const rarityOptions = [
  { value: "all", label: "Tutte" },
  { value: "L", label: "Leader (L)" },
  { value: "SEC", label: "Segreta (SEC)" },
  { value: "SR", label: "Super Rara (SR)" },
  { value: "R", label: "Rara (R)" },
  { value: "UC", label: "Non Comune (UC)" },
  { value: "C", label: "Comune (C)" },
];

const cardsBySeries = {
  "paramount-war": onePieceParamountWarCards,
  "pillars-of-strength": onePiecePillarsOfStrengthCards,
  "kingdoms-of-intrigue": onePieceKingdomsOfIntrigueCards,
  "awakening-of-the-new-era": onePieceAwakeningOfTheNewEraCards,
  "wings-of-the-captain": onePieceWingsOfTheCaptainCards,
  "500-years-in-the-future": onePiece500YearsInTheFutureCards,
  "two-legends": onePieceTwoLegendsCards,
  "emperors-in-the-new-world": onePieceEmperorsInTheNewWorldCards,
  "royal-blood": onePieceRoyalBloodCards,
  "a-fist-of-divine-speed": onePieceAFistOfDivineSpeedCards,
  "legacy-of-the-master": onePieceLegacyOfTheMasterCards,
};

const OnePieceSeriesDetail = () => {
  const { seriesId } = useParams();
  const { user, authLoading } = useAuth();
  const [cardsStatus, setCardsStatus] = useState({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [missingImages, setMissingImages] = useState({});

  const series = onePieceSeries.find((item) => item.id === seriesId);
  const sourceCards = cardsBySeries[seriesId] || [];

  const cards = useMemo(() => {
    if (!series) return [];

    return sourceCards.map((card) => ({
      ...card,
      id: `one-piece-${series.id}-${card.number}`,
      frontImage: `/one-piece-card-game/${series.id}/${card.number}.webp`,
      backImage: series.cardBackImage,
    }));
  }, [series, sourceCards]);

  const ownedCount = Object.values(cardsStatus).filter((card) => card.owned).length;
  const duplicatesCount = Object.values(cardsStatus).reduce(
    (total, card) => total + (card.duplicates || 0),
    0,
  );
  const missingCount = cards.length - ownedCount;

  useEffect(() => {
    const loadCardsStatus = async () => {
      if (authLoading) return;

      if (!user || !series) {
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
          where("seriesId", "==", series.id),
        );
        const snapshot = await getDocs(cardsQuery);
        const savedStatus = {};

        snapshot.docs.forEach((document) => {
          const data = document.data();
          if (!data.cardId) return;

          savedStatus[data.cardId] = {
            owned: Boolean(data.owned),
            duplicates: data.duplicates || 0,
          };
        });

        setCardsStatus(savedStatus);
      } catch (loadError) {
        console.error(loadError);
        setError("Non riesco a caricare le carte salvate.");
      } finally {
        setCardsLoading(false);
      }
    };

    loadCardsStatus();
  }, [authLoading, user, series]);

  const getCardRef = (cardId) => {
    const documentId = `${COLLECTION_ID}_${series.id}_${cardId}`;
    return doc(db, "users", user.uid, "cards", documentId);
  };

  const buildCardData = (card, extraData = {}) => ({
    collectionId: COLLECTION_ID,
    seriesId: series.id,
    cardId: card.id,
    cardNumber: card.number,
    cardName: card.name,
    rarity: card.rarity,
    ...extraData,
    updatedAt: serverTimestamp(),
  });

  const toggleCard = async (card) => {
    if (!user || !series) return;

    const isOwned = Boolean(cardsStatus[card.id]?.owned);
    const cardRef = getCardRef(card.id);
    setSavingCardId(card.id);
    setError("");

    try {
      if (isOwned) {
        await deleteDoc(cardRef);
        setCardsStatus((current) => {
          const next = { ...current };
          delete next[card.id];
          return next;
        });
        return;
      }

      await setDoc(
        cardRef,
        buildCardData(card, {
          owned: true,
          duplicates: 0,
          createdAt: serverTimestamp(),
        }),
        { merge: true },
      );

      setCardsStatus((current) => ({
        ...current,
        [card.id]: { owned: true, duplicates: 0 },
      }));
    } catch (saveError) {
      console.error(saveError);
      setError("Non riesco a salvare questa carta. Riprova.");
    } finally {
      setSavingCardId("");
    }
  };

  const changeDuplicates = async (card, amount) => {
    if (!user || !series) return;

    const currentDuplicates = cardsStatus[card.id]?.duplicates || 0;
    const nextDuplicates = Math.max(0, currentDuplicates + amount);
    const cardRef = getCardRef(card.id);

    setSavingCardId(card.id);
    setError("");

    try {
      if (!cardsStatus[card.id]?.owned) {
        await setDoc(
          cardRef,
          buildCardData(card, {
            owned: true,
            duplicates: nextDuplicates,
            createdAt: serverTimestamp(),
          }),
          { merge: true },
        );
      } else {
        await updateDoc(cardRef, {
          duplicates: nextDuplicates,
          updatedAt: serverTimestamp(),
        });
      }

      setCardsStatus((current) => ({
        ...current,
        [card.id]: { owned: true, duplicates: nextDuplicates },
      }));
    } catch (saveError) {
      console.error(saveError);
      setError("Non riesco ad aggiornare le doppie. Riprova.");
    } finally {
      setSavingCardId("");
    }
  };

  const filteredCards = cards.filter((card) => {
    const isOwned = Boolean(cardsStatus[card.id]?.owned);
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      card.name.toLowerCase().includes(search) ||
      card.code.toLowerCase().includes(search) ||
      String(card.number).includes(search);
    const matchesOwnership =
      ownershipFilter === "all" ||
      (ownershipFilter === "owned" && isOwned) ||
      (ownershipFilter === "missing" && !isOwned);
    const matchesRarity =
      rarityFilter === "all" || card.rarity === rarityFilter;

    return matchesSearch && matchesOwnership && matchesRarity;
  });

  const handleExport = async () => {
    if (exportLoading || !series) return;

    setExportLoading(true);
    setError("");

    try {
      await exportCollectionPng({
        collectionName: "One Piece Card Game",
        seriesName: series.name,
        cards,
        cardsStatus,
      });
    } catch (exportError) {
      console.error(exportError);
      setError("Non riesco a generare la MancoLista. Riprova.");
    } finally {
      setExportLoading(false);
    }
  };

  if (authLoading) {
    return (
      <section className="series-detail">
        <p className="eyebrow">Caricamento</p>
        <h1>Controllo accesso...</h1>
      </section>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!series || sourceCards.length === 0) {
    return (
      <section className="series-detail">
        <Link className="back-link" to="/collezioni/one-piece-card-game">
          ← Torna alle collezioni
        </Link>
        <h1>Collezione non disponibile</h1>
      </section>
    );
  }

  return (
    <section className="series-detail">
      <div className="series-topbar">
        <div>
          <Link className="back-link" to="/collezioni/one-piece-card-game">
            ← Torna alle collezioni
          </Link>

          <p className="eyebrow">One Piece Card Game · {series.code}</p>
          <h1>{series.name}</h1>
          <p>
            {series.name} ({series.code}) da {cards.length} carte. Se l'immagine
            della carta non è disponibile, viene mostrato automaticamente un
            fronte con codice e nome.
          </p>

          <div className="pdf-export-actions">
            <button
              type="button"
              className="export-pdf-button"
              onClick={handleExport}
              disabled={cardsLoading || exportLoading}
            >
              {exportLoading ? "Generazione MancoLista..." : "Esporta MancoLista"}
            </button>
          </div>

          {error && <p className="series-error">{error}</p>}
          {cardsLoading && <p className="series-loading">Caricamento carte...</p>}
        </div>

        <div className="series-stats">
          <div><strong>{ownedCount}</strong><span>Possedute</span></div>
          <div><strong>{missingCount}</strong><span>Mancanti</span></div>
          <div><strong>{duplicatesCount}</strong><span>Doppie</span></div>
        </div>
      </div>

      <div className="series-filters tcg-series-filters">
        <div className="search-field">
          <label htmlFor="one-piece-search">Cerca carta</label>
          <input
            id="one-piece-search"
            type="search"
            placeholder="Numero, codice o nome..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label>Rarità</label>
          <CustomSelect
            value={rarityFilter}
            onChange={setRarityFilter}
            ariaLabel="Seleziona rarità"
            options={rarityOptions}
          />
        </div>

        <div className="filter-field">
          <label>Stato</label>
          <CustomSelect
            value={ownershipFilter}
            onChange={setOwnershipFilter}
            ariaLabel="Seleziona stato"
            options={[
              { value: "all", label: "Tutte" },
              { value: "owned", label: "Possedute" },
              { value: "missing", label: "Mancanti" },
            ]}
          />
        </div>

        <div className="filter-result">
          <strong>{filteredCards.length}</strong>
          <span>risultati</span>
        </div>
      </div>

      {filteredCards.length === 0 && (
        <div className="empty-cards-message">
          <h2>Nessuna carta trovata</h2>
          <p>Prova a cambiare ricerca, rarità o stato.</p>
        </div>
      )}

      <div className="cards-grid">
        {filteredCards.map((card) => {
          const status = cardsStatus[card.id];
          const isOwned = Boolean(status?.owned);
          const duplicates = status?.duplicates || 0;
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
                    {missingImages[card.id] ? (
                      <div className="one-piece-card-placeholder">
                        <strong>{card.code}</strong>
                        <span>{card.name}</span>
                      </div>
                    ) : (
                      <img
                        src={card.frontImage}
                        alt={card.name}
                        loading="lazy"
                        decoding="async"
                        onError={() => {
                          setMissingImages((current) => ({
                            ...current,
                            [card.id]: true,
                          }));
                        }}
                      />
                    )}
                  </div>
                </div>
              </button>

              <div className="brainrot-card-info">
                <span className="card-number">{card.code}</span>
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
                    {isSaving ? "Salvataggio..." : isOwned ? "Ce l'ho" : "Mi manca"}
                  </span>
                </label>

                {isOwned && (
                  <div className="duplicates-control">
                    <span>Doppie</span>
                    <div className="duplicates-actions">
                      <button
                        type="button"
                        onClick={() => changeDuplicates(card, -1)}
                        disabled={cardsLoading || isSaving || duplicates === 0}
                      >
                        -
                      </button>
                      <strong>{duplicates}</strong>
                      <button
                        type="button"
                        onClick={() => changeDuplicates(card, 1)}
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

export default OnePieceSeriesDetail;
