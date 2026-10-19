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

import { disneyLorcanaIntoInklandsCards } from "../data/disneyLorcanaCards";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { exportCollectionPng } from "../utils/exportCollectionPng";

import "../styles/series-detail.css";

const COLLECTION_ID = "disney-lorcana";
const SERIES_ID = "into-the-inklands";
const FALLBACK_IMAGE = "/disney-locarna/disney-locarna-card.webp";

const DisneyLorcanaIntoInklandsDetail = () => {
  const { user, authLoading } = useAuth();
  const [cardsStatus, setCardsStatus] = useState({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [inkFilter, setInkFilter] = useState("all");
  const [missingImages, setMissingImages] = useState({});

  const cards = useMemo(() => {
    return disneyLorcanaIntoInklandsCards.map((card) => ({
      id: `lorcana-into-inklands-${card.number}`,
      number: card.number,
      name: card.name,
      ink: card.ink,
      rarity: card.ink,
      frontImage: `/disney-locarna/into-the-inklands/${card.number}.webp`,
      backImage: FALLBACK_IMAGE,
      fallbackImage: FALLBACK_IMAGE,
    }));
  }, []);

  const ownedCount = Object.values(cardsStatus).filter((card) => card.owned).length;
  const duplicatesCount = Object.values(cardsStatus).reduce(
    (total, card) => total + (card.duplicates || 0),
    0,
  );
  const missingCount = cards.length - ownedCount;

  useEffect(() => {
    const loadCardsStatus = async () => {
      if (authLoading) return;

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
          where("seriesId", "==", SERIES_ID),
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
  }, [authLoading, user]);

  const getCardRef = (cardId) => {
    const documentId = `${COLLECTION_ID}_${SERIES_ID}_${cardId}`;
    return doc(db, "users", user.uid, "cards", documentId);
  };

  const buildCardData = (card, extraData = {}) => ({
    collectionId: COLLECTION_ID,
    seriesId: SERIES_ID,
    cardId: card.id,
    cardNumber: card.number,
    cardName: card.name,
    rarity: card.rarity,
    ...extraData,
    updatedAt: serverTimestamp(),
  });

  const toggleCard = async (card) => {
    if (!user) return;

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
    if (!user) return;

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
      String(card.number).includes(search);
    const matchesOwnership =
      ownershipFilter === "all" ||
      (ownershipFilter === "owned" && isOwned) ||
      (ownershipFilter === "missing" && !isOwned);
    const matchesInk = inkFilter === "all" || card.ink === inkFilter;

    return matchesSearch && matchesOwnership && matchesInk;
  });

  const handleExport = async () => {
    if (exportLoading) return;

    setExportLoading(true);
    setError("");

    try {
      await exportCollectionPng({
        collectionName: "Disney Lorcana",
        seriesName: "Nelle Terre d’Inchiostro",
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

  return (
    <section className="series-detail">
      <div className="series-topbar">
        <div>
          <Link className="back-link" to="/collezioni/disney-lorcana">
            ← Torna alle espansioni
          </Link>

          <p className="eyebrow">Disney Lorcana</p>
          <h1>Nelle Terre d’Inchiostro</h1>
          <p>
            Nelle Terre d’Inchiostro da 204 carte. Se l'immagine della carta non è disponibile,
            viene mostrato automaticamente un fronte con numero e nome.
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
          <label htmlFor="lorcana-search">Cerca carta</label>
          <input
            id="lorcana-search"
            type="search"
            placeholder="Numero o nome..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="lorcana-ink">Inchiostro</label>
          <select
            id="lorcana-ink"
            value={inkFilter}
            onChange={(event) => setInkFilter(event.target.value)}
          >
            <option value="all">Tutti</option>
            <option value="amber">Ambra</option>
            <option value="amethyst">Ametista</option>
            <option value="emerald">Smeraldo</option>
            <option value="ruby">Rubino</option>
            <option value="sapphire">Zaffiro</option>
            <option value="steel">Acciaio</option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="lorcana-status">Stato</label>
          <select
            id="lorcana-status"
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
          <p>Prova a cambiare ricerca o stato.</p>
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
                      <div className="lorcana-card-placeholder">
                        <strong>#{String(card.number).padStart(3, "0")}</strong>
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
                <span className="card-number">
                  #{String(card.number).padStart(3, "0")}/204
                </span>
                <h2>{card.name}</h2>

                <span className="card-rarity">
                  {card.ink === "amber"
                    ? "Ambra"
                    : card.ink === "amethyst"
                      ? "Ametista"
                      : card.ink === "emerald"
                        ? "Smeraldo"
                        : card.ink === "ruby"
                          ? "Rubino"
                          : card.ink === "sapphire"
                            ? "Zaffiro"
                            : "Acciaio"}
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

export default DisneyLorcanaIntoInklandsDetail;
