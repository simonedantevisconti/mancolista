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

const sortCardsByNumber = (cards) => {
  return [...cards].sort((a, b) => {
    const aValue = getCardNumberValue(a);
    const bValue = getCardNumberValue(b);

    const aSort = getSortableNumber(aValue);
    const bSort = getSortableNumber(bValue);

    if (aSort !== bSort) {
      return aSort - bSort;
    }

    return aValue.localeCompare(bValue, "it");
  });
};

const getMissingNumbers = (cards, cardsStatus) => {
  return sortCardsByNumber(
    cards.filter((card) => {
      const status = cardsStatus?.[card.id];
      return !status?.owned;
    }),
  )
    .map((card) => getCardNumberValue(card))
    .filter(Boolean);
};

const getDuplicateNumbers = (cards, cardsStatus) => {
  return sortCardsByNumber(
    cards.filter((card) => {
      const status = cardsStatus?.[card.id];
      return Boolean(status?.owned) && (status?.duplicates || 0) > 0;
    }),
  )
    .map((card) => {
      const number = getCardNumberValue(card);
      const quantity = cardsStatus?.[card.id]?.duplicates || 0;

      if (!number) {
        return "";
      }

      return quantity > 1 ? `${number} (x${quantity})` : number;
    })
    .filter(Boolean);
};

const buildWrappedLines = (context, values, maxWidth) => {
  if (!values.length) {
    return ["Nessuna"];
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
  collectionName,
  seriesName,
  cards,
  cardsStatus,
}) => {
  const title = (seriesName || collectionName || "Collezione").trim();

  const missingNumbers = getMissingNumbers(cards, cardsStatus);
  const duplicateNumbers = getDuplicateNumbers(cards, cardsStatus);

  const baseWidth = 1400;
  const paddingX = 96;
  const paddingTop = 96;
  const paddingBottom = 96;
  const contentWidth = baseWidth - paddingX * 2;

  const titleFontSize = 64;
  const sectionTitleFontSize = 38;
  const contentFontSize = 34;
  const lineHeight = 50;
  const sectionGap = 46;

  const tempCanvas = document.createElement("canvas");
  const tempContext = tempCanvas.getContext("2d");

  tempContext.font = `700 ${contentFontSize}px Arial`;

  const missingLines = buildWrappedLines(
    tempContext,
    missingNumbers,
    contentWidth,
  );

  const duplicateLines = buildWrappedLines(
    tempContext,
    duplicateNumbers,
    contentWidth,
  );

  const titleBlockHeight = 110;
  const sectionHeaderHeight = 82;
  const missingHeight = missingLines.length * lineHeight;
  const duplicateHeight = duplicateLines.length * lineHeight;

  const finalHeight = Math.max(
    650,
    paddingTop +
      titleBlockHeight +
      sectionHeaderHeight +
      missingHeight +
      sectionGap +
      sectionHeaderHeight +
      duplicateHeight +
      paddingBottom,
  );

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = baseWidth * scale;
  canvas.height = finalHeight * scale;

  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.textBaseline = "top";

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, baseWidth, finalHeight);

  context.fillStyle = "#111111";
  context.font = `700 ${titleFontSize}px Arial`;
  context.fillText(title, paddingX, paddingTop);

  let y = paddingTop + titleBlockHeight;

  const drawSection = (label, lines) => {
    context.fillStyle = "#ff7a00";
    context.font = `700 ${sectionTitleFontSize}px Arial`;
    context.fillText(label, paddingX, y);

    y += 54;

    context.strokeStyle = "#ff7a00";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(paddingX, y);
    context.lineTo(baseWidth - paddingX, y);
    context.stroke();

    y += 28;

    context.fillStyle = "#111111";
    context.font = `700 ${contentFontSize}px Arial`;

    lines.forEach((line) => {
      context.fillText(line, paddingX, y);
      y += lineHeight;
    });
  };

  drawSection("Mancanti", missingLines);

  y += sectionGap;

  drawSection("Doppie", duplicateLines);

  const fileName = `${slugify(title)}-mancolista.png`;
  downloadCanvas(canvas, fileName);
};
