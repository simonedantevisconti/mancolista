const QR_MATRIX = [
  "1111111000001110001111111",
  "1000001011001000001000001",
  "1011101011000011101011101",
  "1011101010010110001011101",
  "1011101001010100101011101",
  "1000001001110110101000001",
  "1111111010101010101111111",
  "0000000011110001000000000",
  "1000001010000111111001110",
  "1011010111000001000111110",
  "0010101100011101101101011",
  "1011110010111010011111001",
  "1000111001110000101100001",
  "1111110110001101100100010",
  "1001011010100001010111011",
  "1010100011101000000101101",
  "1010111011001110111110100",
  "0000000011000010100010000",
  "1111111001101100101010001",
  "1000001000110001100010001",
  "1011101000111111111110100",
  "1011101001101011011000011",
  "1011101000000010100001101",
  "1000001000010010101110001",
  "1111111011001010100001001",
];

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

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
};

const drawImageContain = (context, image, x, y, maxWidth, maxHeight) => {
  const ratio = Math.min(
    maxWidth / image.naturalWidth,
    maxHeight / image.naturalHeight,
  );

  const width = image.naturalWidth * ratio;
  const height = image.naturalHeight * ratio;

  context.drawImage(image, x, y + (maxHeight - height) / 2, width, height);
};

const drawQrCode = (context, x, y, size) => {
  const quietZone = 4;
  const matrixSize = QR_MATRIX.length;
  const totalModules = matrixSize + quietZone * 2;
  const moduleSize = size / totalModules;

  context.fillStyle = "#ffffff";
  context.fillRect(x, y, size, size);

  context.fillStyle = "#111111";

  QR_MATRIX.forEach((row, rowIndex) => {
    [...row].forEach((module, columnIndex) => {
      if (module !== "1") {
        return;
      }

      context.fillRect(
        x + (columnIndex + quietZone) * moduleSize,
        y + (rowIndex + quietZone) * moduleSize,
        moduleSize + 0.35,
        moduleSize + 0.35,
      );
    });
  });
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
  const contentWidth = baseWidth - paddingX * 2;

  const titleFontSize = 64;
  const sectionTitleFontSize = 38;
  const contentFontSize = 34;
  const lineHeight = 50;
  const sectionGap = 46;
  const footerHeight = 250;

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

  const contentHeight =
    paddingTop +
    titleBlockHeight +
    sectionHeaderHeight +
    missingHeight +
    sectionGap +
    sectionHeaderHeight +
    duplicateHeight +
    70;

  const finalHeight = Math.max(900, contentHeight + footerHeight);

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = baseWidth * scale;
  canvas.height = finalHeight * scale;

  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.textBaseline = "top";

  // SFONDO
  context.fillStyle = "#111111";
  context.fillRect(0, 0, baseWidth, finalHeight);

  // ACCENTO SUPERIORE
  context.fillStyle = "#ff7a00";
  context.fillRect(0, 0, baseWidth, 16);

  // TITOLO
  context.fillStyle = "#ffffff";
  context.font = `700 ${titleFontSize}px Arial`;
  context.fillText(title, paddingX, paddingTop);

  let y = paddingTop + titleBlockHeight;

  const drawSection = (label, lines) => {
    context.fillStyle = "#ff7a00";
    context.font = `700 ${sectionTitleFontSize}px Arial`;
    context.fillText(label, paddingX, y);

    y += 54;

    context.strokeStyle = "rgba(255, 122, 0, 0.75)";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(paddingX, y);
    context.lineTo(baseWidth - paddingX, y);
    context.stroke();

    y += 28;

    context.fillStyle = "#ffffff";
    context.font = `700 ${contentFontSize}px Arial`;

    lines.forEach((line) => {
      context.fillText(line, paddingX, y);
      y += lineHeight;
    });
  };

  drawSection("Mancanti", missingLines);

  y += sectionGap;

  drawSection("Doppie", duplicateLines);

  // FOOTER PUBBLICITARIO
  const footerTop = finalHeight - footerHeight;

  context.strokeStyle = "rgba(255, 255, 255, 0.14)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(paddingX, footerTop);
  context.lineTo(baseWidth - paddingX, footerTop);
  context.stroke();

  let logoImage = null;

  try {
    logoImage = await loadImage("/mancolista-logo.webp");
  } catch (error) {
    console.warn("Logo MancoLista non disponibile nell'export:", error);
  }

  if (logoImage) {
    drawImageContain(
      context,
      logoImage,
      paddingX,
      footerTop + 52,
      270,
      82,
    );
  } else {
    context.fillStyle = "#ff7a00";
    context.font = "700 42px Arial";
    context.fillText("MancoLista", paddingX, footerTop + 64);
  }

  context.fillStyle = "rgba(255, 255, 255, 0.68)";
  context.font = "400 22px Arial";
  context.fillText(
    "La tua collezione, sempre sotto controllo.",
    paddingX,
    footerTop + 150,
  );

  const qrSize = 160;
  const qrX = baseWidth - paddingX - qrSize;
  const qrY = footerTop + 42;

  drawQrCode(context, qrX, qrY, qrSize);

  context.textAlign = "right";
  context.fillStyle = "#ff7a00";
  context.font = "700 26px Arial";
  context.fillText(
    "Crea la tua MancoLista",
    qrX - 34,
    footerTop + 68,
  );

  context.fillStyle = "#ffffff";
  context.font = "600 21px Arial";
  context.fillText(
    "Scansiona il QR code",
    qrX - 34,
    footerTop + 110,
  );

  context.fillStyle = "rgba(255, 255, 255, 0.58)";
  context.font = "400 19px Arial";
  context.fillText(
    "mancolista.site",
    qrX - 34,
    footerTop + 148,
  );

  context.textAlign = "left";

  const fileName = `${slugify(title)}-mancolista.png`;
  downloadCanvas(canvas, fileName);
};
