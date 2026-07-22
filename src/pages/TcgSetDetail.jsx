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
import { mainCollections } from "../data/collections";
import { collectionProviders } from "../data/collectionProviders";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "../styles/series-detail.css";

const TcgSetDetail = () => {
  const { collectionId, seriesId } = useParams();
  const { user, authLoading } = useAuth();

  const setId = seriesId;

  const [setData, setSetData] = useState(null);
  const [cardsStatus, setCardsStatus] = useState({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");

  const collectionData = mainCollections.find((item) => {
    return item.id === collectionId;
  });

  const provider = collectionData?.provider
    ? collectionProviders[collectionData.provider]
    : null;

  const cards = useMemo(() => {
    return setData?.cards || [];
  }, [setData]);

  const ownedCount = Object.values(cardsStatus).filter((card) => {
    return card.owned;
  }).length;

  const duplicatesCount = Object.values(cardsStatus).reduce((total, card) => {
    return total + (card.duplicates || 0);
  }, 0);

  const missingCount = cards.length - ownedCount;

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const cardStatus = cardsStatus[card.id];
      const isOwned = Boolean(cardStatus?.owned);

      const normalizedSearch = searchTerm.trim().toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        card.name.toLowerCase().includes(normalizedSearch) ||
        String(card.localId || card.number || "").includes(normalizedSearch);

      const matchesOwnership =
        ownershipFilter === "all" ||
        (ownershipFilter === "owned" && isOwned) ||
        (ownershipFilter === "missing" && !isOwned);

      return matchesSearch && matchesOwnership;
    });
  }, [cards, cardsStatus, searchTerm, ownershipFilter]);

  const getCardDocId = (cardId) => {
    return `${collectionId}_${setId}_${cardId}`;
  };

  const getCardRef = (cardId) => {
    const cardDocId = getCardDocId(cardId);
    return doc(db, "users", user.uid, "cards", cardDocId);
  };

  const buildCardFirestoreData = (card, extraData = {}) => {
    return {
      collectionId,
      seriesId: setId,
      setId,
      cardId: card.id,
      cardNumber: card.localId || card.number || "",
      cardName: card.name,
      image: card.image || "",
      rarity: card.rarity || "",
      ...extraData,
      updatedAt: serverTimestamp(),
    };
  };

  useEffect(() => {
    const loadSet = async () => {
      if (authLoading) {
        return;
      }

      if (!user || !provider) {
        setCardsLoading(false);
        return;
      }

      setCardsLoading(true);
      setError("");

      try {
        const nextSetData = await provider.getSetById(setId);
        setSetData(nextSetData);

        const cardsRef = collection(db, "users", user.uid, "cards");

        const cardsQuery = query(
          cardsRef,
          where("collectionId", "==", collectionId),
          where("seriesId", "==", setId),
        );

        const snapshot = await getDocs(cardsQuery);

        const savedCardsStatus = {};

        snapshot.docs.forEach((document) => {
          const cardData = document.data();

          savedCardsStatus[cardData.cardId] = {
            owned: Boolean(cardData.owned),
            duplicates: cardData.duplicates || 0,
          };
        });

        setCardsStatus(savedCardsStatus);
      } catch (error) {
        console.error(error);
        setError("Non riesco a caricare questo set.");
      } finally {
        setCardsLoading(false);
      }
    };

    loadSet();
  }, [authLoading, user, provider, collectionId, setId]);

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

  if (!collectionData || !provider) {
    return (
      <section className="series-detail">
        <h1>Set non disponibile</h1>
        <Link to="/">Torna alla homepage</Link>
      </section>
    );
  }

  if (cardsLoading) {
    return (
      <section className="series-detail">
        <p className="eyebrow">{provider.label}</p>
        <h1>Caricamento carte...</h1>
        <p>Stiamo recuperando le carte della collezione.</p>
      </section>
    );
  }

  if (!setData) {
    return (
      <section className="series-detail">
        <h1>Set non trovato</h1>
        <Link to={`/collezioni/${collectionId}`}>Torna alle espansioni</Link>
      </section>
    );
  }

  return (
    <section className="series-detail">
      <div className="series-topbar">
        <div>
          <Link className="back-link" to={`/collezioni/${collectionId}`}>
            ← Torna alle espansioni
          </Link>

          <p className="eyebrow">{provider.label}</p>
          <h1>{setData.name}</h1>
          <p>
            Segna le carte che hai, quelle mancanti e le doppie. I dati arrivano
            dal provider collegato alla collezione.
            {setData.languageUsed === "en" &&
              " Questo set non era completo in italiano, quindi viene mostrato in inglese."}
          </p>

          {error && <p className="series-error">{error}</p>}
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

      <div className="series-filters tcg-series-filters">
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
          <p>Prova a cambiare ricerca o stato della carta.</p>
        </div>
      )}

      <div className="cards-grid">
        {filteredCards.map((card) => {
          const cardStatus = cardsStatus[card.id];
          const isOwned = Boolean(cardStatus?.owned);
          const duplicates = cardStatus?.duplicates || 0;
          const isSaving = savingCardId === card.id;
          const cardNumber = card.localId || card.number || "?";

          return (
            <article
              className={`brainrot-card tcg-card ${isOwned ? "is-owned" : ""}`}
              key={card.id}
            >
              <button
                className="card-image-button tcg-card-image-button"
                type="button"
                onClick={() => toggleCard(card)}
                disabled={cardsLoading || isSaving}
                aria-label={`Segna ${card.name}`}
              >
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="card-placeholder">No image</div>
                )}
              </button>

              <div className="brainrot-card-info">
                <span className="card-number">#{cardNumber}</span>

                <h2>{card.name}</h2>

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

export default TcgSetDetail;
