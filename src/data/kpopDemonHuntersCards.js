export const kpopDemonHuntersSeries = [
  {
    id: "diramix-official",
    name: "Official Sticker Collection",
    subtitle: "Diramix",
    totalCards: 196,
    itemLabel: "figurine",
    coverImage: "/loghi/kpop-dirammix-official.webp",
    fallbackImage: "/loghi/k-pop-demon-hunter.webp",
  },
  {
    id: "diramix-for-the-fans",
    name: "For The Fans",
    subtitle: "Diramix",
    totalCards: 197,
    itemLabel: "figurine",
    coverImage: "/loghi/kpop-dirammix-for-the-fans.webp",
    fallbackImage: "/loghi/k-pop-demon-hunter.webp",
  },
  {
    id: "kayou-classic-series-1",
    name: "Classic Edition Series 1",
    subtitle: "KAYOU",
    totalCards: 101,
    itemLabel: "card",
    coverImage: "/loghi/kpop-kayou-classic-1.webp",
    fallbackImage: "/loghi/k-pop-demon-hunter.webp",
  },
  {
    id: "kayou-energy-series-1",
    name: "Energy Edition Series 1",
    subtitle: "KAYOU",
    totalCards: 130,
    itemLabel: "card",
    coverImage: "/loghi/kpop-kayou-energy-1.webp",
    fallbackImage: "/loghi/k-pop-demon-hunter.webp",
  },
  {
    id: "kayou-mini-series-1",
    name: "Special Mini Edition Series 1",
    subtitle: "KAYOU",
    totalCards: 41,
    itemLabel: "mini card",
    coverImage: "/loghi/kpop-kayou-mini-1.webp",
    fallbackImage: "/loghi/k-pop-demon-hunter.webp",
  },
  {
    id: "mcdonalds-photocards",
    name: "McDonald's x KPop Demon Hunters",
    subtitle: "Promotional Photocards",
    totalCards: 14,
    itemLabel: "photocard",
    coverImage: "/loghi/kpop-mcdonalds.webp",
    fallbackImage: "/loghi/k-pop-demon-hunter.webp",
  },
];

const raritySets = {
  "kayou-classic-series-1": [
    ["R", 24],
    ["SR", 18],
    ["SSR", 8],
    ["HR", 12],
    ["QR", 10],
    ["UR", 13],
    ["ZR", 8],
    ["CR", 8],
  ],

  "kayou-energy-series-1": [
    ["SR", 18],
    ["SSR", 16],
    ["HR", 24],
    ["QR", 24],
    ["TR", 8],
    ["UR", 13],
    ["LR", 6],
    ["SP", 6],
    ["CR", 8],
    ["BP", 3],
    ["SE", 4],
  ],

  "kayou-mini-series-1": [
    ["SSR", 15],
    ["HR", 9],
    ["LR", 8],
    ["SP", 6],
    ["CR", 3],
  ],
};

const buildRarities = (seriesId, totalCards) => {
  const raritySet = raritySets[seriesId];

  if (!raritySet) {
    return Array.from({ length: totalCards }, () => "standard");
  }

  return raritySet.flatMap(([rarity, count]) => {
    return Array.from({ length: count }, () => rarity);
  });
};

export const generateKpopDemonHuntersCards = (seriesId) => {
  const series = kpopDemonHuntersSeries.find((item) => {
    return item.id === seriesId;
  });

  if (!series) {
    return [];
  }

  const rarities = buildRarities(seriesId, series.totalCards);

  const baseFolder = `/kpop-demon-hunters/${seriesId}`;

  return Array.from({ length: series.totalCards }, (_, index) => {
    const number = index + 1;

    let name = `Card ${number}`;

    if (seriesId === "mcdonalds-photocards") {
      name = `Photocard ${number}`;
    } else if (series.itemLabel === "figurine") {
      name = `Figurina ${number}`;
    }

    return {
      id: `${seriesId}-${number}`,
      number,
      name,
      rarity: rarities[index] || "standard",

      frontImage: `${baseFolder}/${number}.webp`,

      backImage: series.coverImage,

      fallbackImage: series.coverImage,

      finalFallbackImage: series.fallbackImage,
    };
  });
};
