const slugify = (value = "") => {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getCardNumberValue = (card) => {
  if (card?.number !== undefined && card?.number !== null) {
    return String(card.number);
  }

  if (card?.localId !== undefined && card?.localId !== null) {
    return String(card.localId);
  }

  return "";
};

const getSortableNumber = (value) => {
  const numericValue = Number(String(value).replace(/\D/g, ""));

  if (Number.isNaN(numericValue)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return numericValue;
};

const getFilteredCards = ({ cards, cardsStatus, exportType }) => {
  if (!Array.isArray(cards)) {
    return [];
  }

  if (exportType === "missing") {
    return cards.filter((card) => {
      const status = cardsStatus?.[card.id];
      return !status?.owned;
    });
  }

  if (exportType === "duplicates") {
    return cards.filter((card) => {
      const status = cardsStatus?.[card.id];
      return Boolean(status?.owned) && (status?.duplicates || 0) > 0;
    });
  }

  return [];
};

const getOrderedNumbers = (cards) => {
  return [...cards]
    .sort((a, b) => {
      const aValue = getCardNumberValue(a);
      const bValue = getCardNumberValue(b);

      const aSort = getSortableNumber(aValue);
      const bSort = getSortableNumber(bValue);

      if (aSort !== bSort) {
        return aSort - bSort;
      }

      return aValue.localeCompare(bValue, "it");
    })
    .map((card) => getCardNumberValue(card))
    .filter(Boolean);
};

const buildWrappedLines = (context, values, maxWidth) => {
  if (!values.length) {
    return ["Nessuna carta"];
  }

  const lines = [];
  let currentLine = "";

  values.forEach((value) => {
    const nextLine = currentLine ? `${currentLine} - ${value}` : value;

    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = value;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const downloadCanvas = (canvas, fileName) => {
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    },
    "image/png",
    1,
  );
};

export const exportCollectionPng = async ({
  exportType,
  collectionName,
  seriesName,
  cards,
  cardsStatus,
}) => {
  const title = (seriesName || collectionName || "Collezione").trim();
  const label = exportType === "duplicates" ? "Doppie" : "Mancanti";

  const filteredCards = getFilteredCards({
    cards,
    cardsStatus,
    exportType,
  });

  const orderedNumbers = getOrderedNumbers(filteredCards);

  const baseWidth = 1400;
  const paddingX = 96;
  const paddingTop = 96;
  const paddingBottom = 96;
  const contentWidth = baseWidth - paddingX * 2;

  const tempCanvas = document.createElement("canvas");
  const tempContext = tempCanvas.getContext("2d");

  tempContext.font = "700 34px Arial";
  const lines = buildWrappedLines(tempContext, orderedNumbers, contentWidth);

  const titleFontSize = 64;
  const labelFontSize = 38;
  const contentFontSize = 34;
  const lineHeight = 50;

  const headerHeight = 170;
  const contentHeight = lines.length * lineHeight;
  const finalHeight = Math.max(
    500,
    paddingTop + headerHeight + contentHeight + paddingBottom,
  );

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = baseWidth * scale;
  canvas.height = finalHeight * scale;

  const context = canvas.getContext("2d");
  context.scale(scale, scale);

  // Background
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, baseWidth, finalHeight);

  // Title
  context.fillStyle = "#111111";
  context.font = `700 ${titleFontSize}px Arial`;
  context.textBaseline = "top";
  context.fillText(title, paddingX, paddingTop);

  // Label
  context.fillStyle = "#ff7a00";
  context.font = `700 ${labelFontSize}px Arial`;
  context.fillText(label, paddingX, paddingTop + 86);

  // Divider
  context.strokeStyle = "#ff7a00";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(paddingX, paddingTop + 142);
  context.lineTo(baseWidth - paddingX, paddingTop + 142);
  context.stroke();

  // Numbers
  context.fillStyle = "#111111";
  context.font = `700 ${contentFontSize}px Arial`;

  let y = paddingTop + 182;

  lines.forEach((line) => {
    context.fillText(line, paddingX, y);
    y += lineHeight;
  });

  const fileName = `${slugify(title)}-${slugify(label)}.png`;
  downloadCanvas(canvas, fileName);
};
