import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/series-detail.css";

// Il pulsante apre esclusivamente l'immagine, senza modificare le carte salvate.
const CardPreviewButton = ({ card, unavailable = false }) => {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(!unavailable);

  useEffect(() => {
    setAvailable(!unavailable);
    setOpen(false);
  }, [unavailable, card.frontImage]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!card.frontImage || !available) return null;

  const showImage = () => {
    const image = new Image();
    image.onload = () => setOpen(true);
    image.onerror = () => setAvailable(false);
    image.src = card.frontImage;
  };

  return (
    <>
      <button
        type="button"
        className="card-preview-button"
        onClick={(event) => {
          event.stopPropagation();
          showImage();
        }}
      >
        Anteprima
      </button>
      {open && createPortal(
        <div
          className="card-preview-overlay card-preview-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label={`Anteprima immagine ${card.name}`}
          onClick={() => setOpen(false)}
        >
          <button
            className="card-preview-close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Chiudi anteprima"
          >
            ×
          </button>
          <img
            className="card-preview-image"
            src={card.frontImage}
            alt={card.name}
            onClick={(event) => event.stopPropagation()}
            onError={() => setOpen(false)}
          />
        </div>,
        document.body,
      )}
    </>
  );
};

export default CardPreviewButton;
