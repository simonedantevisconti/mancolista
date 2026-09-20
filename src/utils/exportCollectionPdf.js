import { jsPDF } from "jspdf";

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
    return card.number;
  }

  if (card?.localId !== undefined && card?.localId !== null) {
    return card.localId;
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

const buildNumbersText = (cards) => {
  const orderedCards = [...cards].sort((a, b) => {
    const aValue = getCardNumberValue(a);
    const bValue = getCardNumberValue(b);

    const aSort = getSortableNumber(aValue);
    const bSort = getSortableNumber(bValue);

    if (aSort !== bSort) {
      return aSort - bSort;
    }

    return String(aValue).localeCompare(String(bValue), "it");
  });

  return orderedCards
    .map((card) => getCardNumberValue(card))
    .filter((value) => value !== "")
    .join(" - ");
};

const drawPageHeader = ({
  doc,
  title,
  label,
  pageNumber = 1,
  totalPages = 1,
}) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(title, 16, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 122, 0);
  doc.text(label, 16, 34);

  if (totalPages > 1) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Pagina ${pageNumber}/${totalPages}`, pageWidth - 16, 24, {
      align: "right",
    });
  }

  doc.setDrawColor(255, 122, 0);
  doc.setLineWidth(0.7);
  doc.line(16, 39, pageWidth - 16, 39);
};

export const exportCollectionPdf = async ({
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

  const numbersText =
    buildNumbersText(filteredCards) || "Nessuna carta da mostrare";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = doc.internal.pageSize.getWidth() - 32;
  const startY = 50;
  const bottomMargin = 16;

  const fontSizesToTry = [18, 16, 14, 13, 12, 11, 10];
  let selectedFontSize = 18;
  let selectedLines = [];
  let selectedLineHeight = 8;
  let selectedPagesNeeded = 1;
  let selectedLinesPerPage = 1;

  for (const fontSize of fontSizesToTry) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);

    const lines = doc.splitTextToSize(numbersText, maxWidth);
    const lineHeight = Math.max(5.5, fontSize * 0.42);
    const availableHeight = pageHeight - startY - bottomMargin;
    const linesPerPage = Math.floor(availableHeight / lineHeight);
    const pagesNeeded = Math.ceil(lines.length / linesPerPage);

    if (pagesNeeded <= 2) {
      selectedFontSize = fontSize;
      selectedLines = lines;
      selectedLineHeight = lineHeight;
      selectedPagesNeeded = pagesNeeded;
      selectedLinesPerPage = linesPerPage;
      break;
    }

    selectedFontSize = fontSize;
    selectedLines = lines;
    selectedLineHeight = lineHeight;
    selectedPagesNeeded = pagesNeeded;
    selectedLinesPerPage = linesPerPage;
  }

  const totalPages = Math.min(selectedPagesNeeded, 2);

  let currentIndex = 0;

  for (let page = 1; page <= totalPages; page += 1) {
    if (page > 1) {
      doc.addPage();
    }

    drawPageHeader({
      doc,
      title,
      label,
      pageNumber: page,
      totalPages,
    });

    doc.setTextColor(25, 25, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(selectedFontSize);

    const pageLines = selectedLines.slice(
      currentIndex,
      currentIndex + selectedLinesPerPage,
    );

    doc.text(pageLines, 16, startY, {
      maxWidth,
      lineHeightFactor: selectedLineHeight / selectedFontSize,
    });

    currentIndex += selectedLinesPerPage;
  }

  const fileName = `${slugify(title)}-${slugify(label)}.pdf`;
  doc.save(fileName);
};
