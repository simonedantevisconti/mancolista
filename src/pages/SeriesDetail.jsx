import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  generateBrainrotCards,
  italianBrainrotSeries,
} from "../data/collections";
import "../styles/series-detail.css";

const SeriesDetail = () => {
  const { collectionId, seriesId } = useParams();

  const [ownedCards, setOwnedCards] = useState([]);

  const series = italianBrainrotSeries.find((item) => item.id === seriesId);

  const cards = useMemo(() => {
    return generateBrainrotCards(seriesId);
  }, [seriesId]);

  const ownedCount = ownedCards.length;
  const missingCount = cards.length - ownedCount;

  const toggleCard = (cardId) => {
    setOwnedCards((currentCards) => {
      if (currentCards.includes(cardId)) {
        return currentCards.filter((id) => id !== cardId);
      }

      return [...currentCards, cardId];
    });
  };

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
            quelle mancanti mostrano il retro.
          </p>
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
            <strong>{cards.length}</strong>
            <span>Totali</span>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card) => {
          const isOwned = ownedCards.includes(card.id);

          return (
            <article
              className={`brainrot-card ${isOwned ? "is-owned" : ""}`}
              key={card.id}
            >
              <button
                className="card-image-button"
                type="button"
                onClick={() => toggleCard(card.id)}
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
                    onChange={() => toggleCard(card.id)}
                  />
                  <span>{isOwned ? "Ce l'ho" : "Mi manca"}</span>
                </label>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default SeriesDetail;
