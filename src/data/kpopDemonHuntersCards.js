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

const classicEditionGroups = [
  {
    rarity: "CR",
    names: ["Rumi", "Mira", "Zoey", "Jinu", "Baby", "Abby", "Mystery", "Romance"],
  },
  {
    rarity: "ZR",
    names: ["Rumi", "Zoey", "Mira", "HUNTR/X", "Rumi&Jinu", "Jinu", "Saja Boys", "Jinu"],
  },
  {
    rarity: "UR",
    names: [
      "Rumi",
      "Mira",
      "Zoey",
      "Jinu",
      "Abby",
      "Romance",
      "Mystery",
      "Baby",
      "Jinu",
      "Abby",
      "Romance",
      "Mystery",
      "Baby",
    ],
  },
  {
    rarity: "QR",
    names: ["Rumi", "Mira", "Zoey", "Jinu", "Baby", "Abby", "Mystery", "Romance", "DERPY", "Jinu"],
  },
  {
    rarity: "HR",
    names: [
      "Infatuation",
      "Gimbap",
      "Snack Attack",
      "Intimidate",
      "Doctor Han",
      "Makeup",
      "Aunties",
      "Sussie Bird",
      "In Denial",
      "Spicy Challenge",
      "Demon",
      "Pre-show Ramyeon",
    ],
  },
  {
    rarity: "SSR",
    names: ["Rumi", "Mira", "Zoey", "Jinu", "Baby", "Abby", "Mystery", "Romance"],
  },
  {
    rarity: "SR",
    names: [
      "Rumi",
      "Mira",
      "Zoey",
      "Rumi",
      "Mira",
      "Zoey",
      "Jinu",
      "Baby",
      "Mystery",
      "Romance",
      "Abby",
      "SUSSIE",
      "DERPY",
      "Bobby",
      "CELINE",
      "DEMON",
      "DEMON",
      "DEMON",
    ],
  },
  {
    rarity: "R",
    names: [
      "Interrupted Snacking",
      "Hello Friend",
      "Fight",
      "Saja Boys",
      "HUNTR/X",
      "Stage Ready",
      "Disguise",
      "Train Battle",
      "Quick Huddle",
      "Flight Fight",
      "Golden",
      "Rumi",
      "Join the Pride",
      "HUNTR/X",
      "Derpy Tiger",
      "Rose",
      "Stage",
      "Rumi",
      "Aunties",
      "Stage",
      "Crying Demon",
      "Bathhouse",
      "Not Our Fans",
      "Golden Music Video",
    ],
  },
];

export const kayouClassicSeries1Cards = classicEditionGroups.flatMap(
  ({ rarity, names }) => {
    return names.map((name, index) => {
      const rarityNumber = String(index + 1).padStart(3, "0");
      const code = `KPDH01-${rarity}-${rarityNumber}`;

      return {
        id: code,
        code,
        name,
        rarity,
      };
    });
  },
);

const raritySets = {
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

  const baseFolder = `/kpop-demon-hunters/${seriesId}`;

  if (seriesId === "kayou-classic-series-1") {
    return kayouClassicSeries1Cards.map((card, index) => ({
      ...card,
      number: index + 1,
      frontImage: `${baseFolder}/${card.code}.webp`,
      backImage: series.coverImage,
      fallbackImage: series.coverImage,
      finalFallbackImage: series.fallbackImage,
    }));
  }

  const rarities = buildRarities(seriesId, series.totalCards);

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
