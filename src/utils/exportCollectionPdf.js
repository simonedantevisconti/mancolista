const cleanPdfText = (value = "") => {
  return String(value)
    .replaceAll("’", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("–", "-")
    .replaceAll("—", "-");
};

const createSafeFilename = (value = "") => {
  return cleanPdfText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const exportCollectionPdf = async ({
  username,
  collectionName,
  seriesName,
  cards,
  cardsStatus,
}) => {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const document = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const ownedCards = cards.filter((card) => {
    return Boolean(cardsStatus[card.id]?.owned);
  });

  const missingCards = cards.filter((card) => {
    return !cardsStatus[card.id]?.owned;
  });

  const duplicatesCount = Object.values(cardsStatus).reduce((total, card) => {
    return total + (card.duplicates || 0);
  }, 0);

  const generatedDate = new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  document.setProperties({
    title: `${collectionName} - ${seriesName}`,
    subject: "Lista carte mancanti",
    author: "MancoLista",
    creator: "MancoLista",
  });

  document.setFillColor(255, 122, 0);
  document.rect(0, 0, 210, 28, "F");

  document.setTextColor(17, 17, 17);
  document.setFont("helvetica", "bold");
  document.setFontSize(22);
  document.text("MancoLista", 15, 18);

  document.setTextColor(25, 25, 25);
  document.setFontSize(18);
  document.text(cleanPdfText(collectionName), 15, 42);

  document.setFontSize(13);
  document.setFont("helvetica", "normal");
  document.text(cleanPdfText(seriesName), 15, 50);

  document.setTextColor(90, 90, 90);
  document.setFontSize(10);
  document.text(
    `Utente: ${cleanPdfText(username || "Utente MancoLista")}`,
    15,
    59,
  );
  document.text(`Generato il: ${generatedDate}`, 15, 65);

  autoTable(document, {
    startY: 74,
    theme: "grid",
    head: [["Possedute", "Mancanti", "Doppie", "Totale"]],
    body: [
      [
        String(ownedCards.length),
        String(missingCards.length),
        String(duplicatesCount),
        String(cards.length),
      ],
    ],
    styles: {
      font: "helvetica",
      halign: "center",
      cellPadding: 4,
      fontSize: 10,
    },
    headStyles: {
      fillColor: [35, 35, 35],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [25, 25, 25],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
  });

  const summaryTableEnd = document.lastAutoTable.finalY;

  document.setTextColor(25, 25, 25);
  document.setFont("helvetica", "bold");
  document.setFontSize(15);
  document.text(
    `Carte mancanti (${missingCards.length})`,
    15,
    summaryTableEnd + 14,
  );

  if (missingCards.length === 0) {
    document.setFont("helvetica", "normal");
    document.setFontSize(11);
    document.setTextColor(70, 70, 70);
    document.text(
      "Complimenti: hai completato questa serie.",
      15,
      summaryTableEnd + 23,
    );
  } else {
    autoTable(document, {
      startY: summaryTableEnd + 20,
      theme: "striped",
      head: [["Numero", "Nome carta", "Rarita"]],
      body: missingCards.map((card) => {
        return [
          `#${String(card.number).padStart(3, "0")}`,
          cleanPdfText(card.name),
          cleanPdfText(card.rarity || "Da verificare"),
        ];
      }),
      columnStyles: {
        0: {
          cellWidth: 25,
          halign: "center",
        },
        1: {
          cellWidth: "auto",
        },
        2: {
          cellWidth: 42,
        },
      },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
        textColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [255, 122, 0],
        textColor: [17, 17, 17],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [246, 246, 246],
      },
      margin: {
        left: 15,
        right: 15,
        bottom: 18,
      },
      didDrawPage: () => {
        const pageNumber = document.getNumberOfPages();
        const pageHeight = document.internal.pageSize.getHeight();

        document.setFont("helvetica", "normal");
        document.setFontSize(8);
        document.setTextColor(120, 120, 120);

        document.text(`MancoLista - Pagina ${pageNumber}`, 15, pageHeight - 8);

        document.text(
          cleanPdfText(`${collectionName} - ${seriesName}`),
          195,
          pageHeight - 8,
          {
            align: "right",
          },
        );
      },
    });
  }

  const filenameCollection = createSafeFilename(collectionName);
  const filenameSeries = createSafeFilename(seriesName);

  document.save(
    `mancolista-${filenameCollection}-${filenameSeries}-mancanti.pdf`,
  );
};
