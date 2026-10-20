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
import {
  generateKpopDemonHuntersCards,
  kpopDemonHuntersSeries,
} from "../data/kpopDemonHuntersCards";
import CustomSelect from "../components/CustomSelect";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { exportCollectionPng } from "../utils/exportCollectionPng";
import "../styles/series-detail.css";

const COLLECTION_ID = "k-pop-demon-hunters";

const KpopDemonHuntersSeriesDetail = () => {
  const { collectionId, seriesId } = useParams();
  const { user, authLoading } = useAuth();
  const [cardsStatus, setCardsStatus] = useState({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [previewCard, setPreviewCard] = useState(null);
  const [missingImages, setMissingImages] = useState({});

  const series = kpopDemonHuntersSeries.find((item) => item.id === seriesId);
  const cards = useMemo(
    () => generateKpopDemonHuntersCards(seriesId),
    [seriesId],
  );

  const rarities = useMemo(() => {
    return [...new Set(cards.map((card) => card.rarity))];
  }, [cards]);

  const ownedCount = Object.values(cardsStatus).filter((card) => card.owned).length;
  const duplicatesCount = Object.values(cardsStatus).reduce(
    (total, card) => total + (card.duplicates || 0),
    0,
  );
  const missingCount = cards.length - ownedCount;

  useEffect(() => {
    if (!previewCard) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewCard(null);
      }
    };

    document.body.classList.add("card-preview-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("card-preview-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewCard]);

  useEffect(() => {
    const loadCards = async () => {
      if (authLoading) return;

      if (!user || collectionId !== COLLECTION_ID || !series) {
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
          where("seriesId", "==", seriesId),
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
        setError("Non riesco a caricare gli elementi salvati.");
      } finally {
        setCardsLoading(false);
      }
    };

    loadCards();
  }, [authLoading, user, collectionId, seriesId, series]);

  const getCardRef = (cardId) => {
    const documentId = `${COLLECTION_ID}_${seriesId}_${cardId}`;
    return doc(db, "users", user.uid, "cards", documentId);
  };

  const buildCardData = (card, extraData = {}) => ({
    collectionId: COLLECTION_ID,
    seriesId,
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
      setError("Non riesco a salvare questo elemento. Riprova.");
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
      String(card.number).includes(search) ||
      card.code?.toLowerCase().includes(search);
    const matchesRarity =
      rarityFilter === "all" || card.rarity === rarityFilter;
    const matchesOwnership =
      ownershipFilter === "all" ||
      (ownershipFilter === "owned" && isOwned) ||
      (ownershipFilter === "missing" && !isOwned);

    return matchesSearch && matchesRarity && matchesOwnership;
  });

  const handleExport = async () => {
    if (!series || exportLoading) return;

    setExportLoading(true);
    setError("");

    try {
      await exportCollectionPng({
        collectionName: "K-Pop Demon Hunters",
        seriesName: `${series.subtitle} - ${series.name}`,
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

  if (collectionId !== COLLECTION_ID || !series) {
    return (
      <section className="series-detail">
        <h1>Collezione non disponibile</h1>
        <Link to={`/collezioni/${COLLECTION_ID}`}>Torna alle collezioni</Link>
      </section>
    );
  }

  return (
    <section className="series-detail">
      <div className="series-topbar">
        <div>
          <Link className="back-link" to={`/collezioni/${COLLECTION_ID}`}>
            ← Torna alle collezioni
          </Link>

          <p className="eyebrow">{series.subtitle}</p>
          <h1>{series.name}</h1>
          <p>
            Segna gli elementi che possiedi, controlla i mancanti e gestisci le
            doppie.
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
          {cardsLoading && <p className="series-loading">Caricamento...</p>}
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
          <label htmlFor="kpop-search">Cerca</label>
          <input
            id="kpop-search"
            type="search"
            placeholder="Numero o nome..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="kpop-rarity">Rarità</label>
          <CustomSelect
            value={rarityFilter}
            onChange={setRarityFilter}
            ariaLabel="Seleziona rarità"
            options={[
              { value: "all", label: "Tutte" },
            ]}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="kpop-status">Stato</label>
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
          <h2>Nessun elemento trovato</h2>
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
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = card.finalFallbackImage;
                      }}
                    />
                  </div>

                  <div className="card-face card-front">
                    {missingImages[card.id] ? (
                      <div className="diramix-image-placeholder">
                        <strong>{card.code}</strong>
                        <span>Immagine non disponibile</span>
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
                  {card.code || `#${String(card.number).padStart(3, "0")}`}
                </span>

                <h2>{card.name}</h2>

                <span
                  className={`card-rarity kpop-rarity kpop-rarity-${String(card.rarity)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}`}
                >
                  {card.rarity === "standard" ? "Standard" : card.rarity}
                </span>

                {!missingImages[card.id] && (
                  <button
                    type="button"
                    className="card-preview-button"
                    onClick={() => setPreviewCard(card)}
                  >
                    Anteprima
                  </button>
                )}

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

      {previewCard && (
        <div
          className="card-preview-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewCard(null);
            }
          }}
        >
          <div
            className="card-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Anteprima ${previewCard.name}`}
          >
            <button
              type="button"
              className="card-preview-close"
              onClick={() => setPreviewCard(null)}
              aria-label="Chiudi anteprima"
            >
              ×
            </button>

            <img
              src={previewCard.frontImage}
              alt={previewCard.name}
              className="card-preview-image"
              onError={(event) => {
                const image = event.currentTarget;

                if (image.dataset.fallbackApplied === "true") {
                  image.onerror = null;
                  image.src = previewCard.finalFallbackImage;
                  return;
                }

                image.dataset.fallbackApplied = "true";
                image.src = previewCard.fallbackImage;
              }}
            />

            <div className="card-preview-info">
              <span>{previewCard.code || `#${String(previewCard.number).padStart(3, "0")}`}</span>
              <h2>{previewCard.name}</h2>
              <strong>
                {previewCard.rarity === "standard"
                  ? "Standard"
                  : previewCard.rarity}
              </strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default KpopDemonHuntersSeriesDetail;
