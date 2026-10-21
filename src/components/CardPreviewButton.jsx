import { useEffect, useState } from "react";
import "../styles/series-detail.css";

// Anteprima indipendente: non modifica lo stato delle carte su Firebase.
const CardPreviewButton = ({ card, unavailable = false }) => {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(!unavailable);

  useEffect(() => {
    setAvailable(!unavailable);
  }, [unavailable, card.frontImage]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.classList.add("card-preview-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("card-preview-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!card.frontImage || !available) return null;

  const openPreview = () => {
    const image = new Image();
    image.onload = () => setOpen(true);
    image.onerror = () => setAvailable(false);
    image.src = card.frontImage;
  };

  return (
    <>
      <button type="button" className="card-preview-button" onClick={openPreview}>
        Anteprima
      </button>

      {open && (
        <div
          className="card-preview-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="card-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Anteprima ${card.name}`}
          >
            <button
              type="button"
              className="card-preview-close"
              onClick={() => setOpen(false)}
              aria-label="Chiudi anteprima"
            >
              ×
            </button>
            <img
              className="card-preview-image"
              src={card.frontImage}
              alt={card.name}
            />
            <div className="card-preview-info">
              <span>{card.code || `#${String(card.number || "").padStart(3, "0")}`}</span>
              <h2>{card.name}</h2>
              {card.rarity && <strong>{card.rarity}</strong>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardPreviewButton;
