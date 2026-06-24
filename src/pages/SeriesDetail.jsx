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
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../styles/series-detail.css";

const SeriesDetail = () => {
  const { collectionId, seriesId } = useParams();
  const { user, authLoading } = useAuth();

  const [cardsStatus, setCardsStatus] = useState({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState("");
  const [error, setError] = useState("");

  const series = italianBrainrotSeries.find((item) => item.id === seriesId);

  const cards = useMemo(() => {
    return generateBrainrotCards(seriesId);
  }, [seriesId]);

  const ownedCount = Object.values(cardsStatus).filter((card) => {
    return card.owned;
  }).length;

  const duplicatesCount = Object.values(cardsStatus).reduce((total, card) => {
    return total + (card.duplicates || 0);
  }, 0);

  const missingCount = cards.length - ownedCount;

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
        setError("Non riesco a caricare le carte salvate.");
      } finally {
        setCardsLoading(false);
      }
    };

    loadCardsStatus();
  }, [authLoading, user, collectionId, seriesId, series]);

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
        {
          collectionId,
          seriesId,
          cardId: card.id,
          cardNumber: card.number,
          cardName: card.name,
          rarity: card.rarity,
          owned: true,
          duplicates: 0,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
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
        {
          collectionId,
          seriesId,
          cardId: card.id,
          cardNumber: card.number,
          cardName: card.name,
          rarity: card.rarity,
          owned: true,
          duplicates: nextDuplicates,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
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

      <div className="cards-grid">
        {cards.map((card) => {
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
                    <img src={card.backImage} alt={`Retro ${card.name}`} />
                  </div>

                  <div className="card-face card-front">
                    <img src={card.frontImage} alt={card.name} />
                  </div>
                </div>
              </button>

              <div className="brainrot-card-info">
                <span className="card-number">
                  #{String(card.number).padStart(3, "0")}
                </span>

                <h2>{card.name}</h2>
                <p>{card.rarity}</p>

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
