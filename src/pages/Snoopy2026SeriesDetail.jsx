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
  generateSnoopy2026Cards,
  snoopy2026Series,
} from "../data/snoopy2026Cards";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { exportCollectionPng } from "../utils/exportCollectionPng";
import "../styles/series-detail.css";

const COLLECTION_ID = "snoopy-un-anno-da-ricordare-2026";

const categoryLabels = {
  album: "Album",
  poster: "Poster",
  "limited-edition": "Limited Edition",
};

const Snoopy2026SeriesDetail = () => {
  const { collectionId, seriesId } = useParams();
  const { user, authLoading } = useAuth();
  const [cardsStatus, setCardsStatus] = useState({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");

  const series = snoopy2026Series.find((item) => item.id === seriesId);
  const cards = useMemo(() => generateSnoopy2026Cards(seriesId), [seriesId]);

  const ownedCount = Object.values(cardsStatus).filter((card) => card.owned).length;
  const duplicatesCount = Object.values(cardsStatus).reduce(
    (total, card) => total + (card.duplicates || 0),
    0,
  );
  const missingCount = cards.length - ownedCount;

  const categories = useMemo(() => {
    return [...new Set(cards.map((card) => card.category))];
  }, [cards]);

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
    category: card.category,
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
      if (currentDuplicates === 0 && amount > 0) {
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
      String(card.number).toLowerCase().includes(search);
    const matchesCategory =
      categoryFilter === "all" || card.category === categoryFilter;
    const matchesOwnership =
      ownershipFilter === "all" ||
      (ownershipFilter === "owned" && isOwned) ||
      (ownershipFilter === "missing" && !isOwned);

    return matchesSearch && matchesCategory && matchesOwnership;
  });

  const handleExport = async () => {
    if (!series || exportLoading) return;
    setExportLoading(true);
    setError("");

    try {
      await exportCollectionPng({
        collectionName: "Snoopy - Un anno da ricordare 2026",
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

  if (collectionId !== COLLECTION_ID || !series) {
    return (
      <section className="series-detail">
        <h1>Raccolta non disponibile</h1>
        <Link to={`/collezioni/${COLLECTION_ID}`}>Torna alle raccolte</Link>
      </section>
    );
  }

  return (
    <section className="series-detail">
      <div className="series-topbar">
        <div>
          <Link className="back-link" to={`/collezioni/${COLLECTION_ID}`}>
            ← Torna alle raccolte
          </Link>
          <p className="eyebrow">Snoopy - Un anno da ricordare 2026</p>
          <h1>{series.name}</h1>
          <p>
            Segna gli elementi che possiedi, controlla i mancanti e indica le
            doppie. Le immagini reali potranno essere collegate appena disponibili.
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
          <label htmlFor="snoopy-search">Cerca</label>
          <input
            id="snoopy-search"
            type="search"
            placeholder="Numero o nome..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="snoopy-category">Categoria</label>
          <select
            id="snoopy-category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Tutte</option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {categoryLabels[category] || category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="snoopy-status">Stato</label>
          <select
            id="snoopy-status"
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
          <h2>Nessun elemento trovato</h2>
          <p>Prova a cambiare ricerca, categoria o stato.</p>
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
                <span className="card-number">{card.number}</span>
                <h2>{card.name}</h2>
                <span className="card-rarity">
                  {categoryLabels[card.category] || card.category}
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

export default Snoopy2026SeriesDetail;
