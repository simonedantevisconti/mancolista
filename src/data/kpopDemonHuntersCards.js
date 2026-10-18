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
    totalCards: 13,
    itemLabel: "photocard",
    coverImage: "/loghi/kpop-mcdonalds.webp",
    fallbackImage: "/loghi/k-pop-demon-hunter.webp",
  },
];

const createDiramixChecklist = (totalCards) => {
  return Array.from({ length: totalCards }, (_, index) => {
    const number = index + 1;
    const code = String(number).padStart(3, "0");

    return {
      id: code,
      code,
      number,
      name: `Figurina ${code}`,
      rarity: "da-verificare",
    };
  });
};

export const diramixOfficialCards = createDiramixChecklist(196);
export const diramixForTheFansCards = createDiramixChecklist(197);

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

const energyEditionGroups = [
  {
    rarity: "SE",
    names: ["Rumi", "Mira", "Zoey", "HUNTR/X"],
  },
  {
    rarity: "BP",
    names: ["Rumi", "Mira", "Zoey"],
  },
  {
    rarity: "DCR",
    names: ["Rumi", "Mira", "Zoey", "Jinu", "Baby", "Abby", "Mystery", "Romance"],
  },
  {
    rarity: "SP",
    names: ["Rumi", "Mira", "Zoey", "Rumi", "Mira", "Zoey"],
  },
  {
    rarity: "LR",
    names: ["Jinu", "Baby", "Abby", "Mystery", "Romance", "SAJABOYS"],
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
    rarity: "TR",
    names: ["Rumi", "Mira", "Zoey", "Jinu", "Baby", "Abby", "Mystery", "Romance"],
  },
  {
    rarity: "QR",
    names: [
      "Rumi",
      "Mira",
      "Zoey",
      "Jinu",
      "Baby",
      "Abby",
      "Mystery",
      "Romance",
      "DERPY",
      "Jinu",
      "Zoey",
      "Rumi",
      "Mira",
      "HUNTR/X",
      "BOBBY",
      "DEMON",
      "RUJINU",
      "JINU",
      "DEMON",
      "SUSSIE",
      "HUNTR/X",
      "Rumi",
      "Mira",
      "Zoey",
    ],
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
      "Mesmerized",
      "Demon Abby",
      "Demon Mystery",
      "Demon Romance",
      "Demon Baby",
      "Demon Mystery",
      "Final Battle",
      "Zoeystery",
      "RuJinu",
      "MiRomAbby",
      "Battle Face",
      "Battle Face",
    ],
  },
  {
    rarity: "SSR",
    names: [
      "Rumi",
      "Mira",
      "Zoey",
      "Jinu",
      "Baby",
      "Abby",
      "Mystery",
      "Romance",
      "Rumi",
      "Mira",
      "Zoey",
      "Jinu",
      "Baby",
      "Abby",
      "Mystery",
      "Romance",
    ],
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
];

export const kayouEnergySeries1Cards = energyEditionGroups.flatMap(
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

const miniEditionGroups = [
  {
    rarity: "CR",
    names: ["Rumi", "Mira", "Zoey"],
  },
  {
    rarity: "SP",
    names: ["Rumi", "Mira", "Zoey", "Rumi", "Mira", "Zoey"],
  },
  {
    rarity: "LR",
    names: ["Rumi", "Mira", "Zoey", "Jinu", "Abby", "Romance", "Mystery", "Baby"],
  },
  {
    rarity: "HR",
    names: [
      "Rumi",
      "Mira",
      "Zoey",
      "Jinu",
      "Baby",
      "Abby",
      "Mystery",
      "Romance",
      "DERPY&SUSSIE",
    ],
  },
  {
    rarity: "SSR",
    names: [
      "Interrupted Snacks",
      "Pre-show Ramyeon",
      "In a Hurry",
      "Carb-loading",
      "Snacks",
      "Saja boys",
      "Jinu & Rumi",
      "MiRomAbby",
      "Zoeystery",
      "In Denial",
      "Zoey",
      "Mira",
      "Rumi",
      "Infatuation",
      "Mesmerized",
    ],
  },
];

export const kayouMiniSeries1Cards = miniEditionGroups.flatMap(
  ({ rarity, names }) => {
    return names.map((name, index) => {
      const rarityNumber = String(index + 1).padStart(3, "0");
      const code = `KPDHM01-${rarity}-${rarityNumber}`;

      return {
        id: code,
        code,
        name,
        rarity,
      };
    });
  },
);

export const mcdonaldsPhotocards = [
  { id: "rumi", name: "Rumi" },
  { id: "mira", name: "Mira" },
  { id: "zoey", name: "Zoey" },
  { id: "huntrix", name: "Huntrix" },
  { id: "rumi-patterns", name: "Rumi (Patterns)" },
  { id: "rumi-jinu", name: "Rumi / Jinu" },
  { id: "saja-boys", name: "Saja Boys" },
  { id: "jinu", name: "Jinu" },
  { id: "romance-saja", name: "Romance Saja" },
  { id: "mystery-saja", name: "Mystery Saja" },
  { id: "abby-saja", name: "Abby Saja" },
  { id: "baby-saja", name: "Baby Saja" },
  { id: "jinu-patterns", name: "Jinu (Patterns)" },
];

export const generateKpopDemonHuntersCards = (seriesId) => {
  const series = kpopDemonHuntersSeries.find((item) => {
    return item.id === seriesId;
  });

  if (!series) {
    return [];
  }

  const baseFolder = `/kpop-demon-hunters/${seriesId}`;

  if (seriesId === "diramix-official") {
    return diramixOfficialCards.map((card) => ({
      ...card,
      frontImage: `${baseFolder}/${card.code}.webp`,
      backImage: series.coverImage,
      fallbackImage: series.coverImage,
      finalFallbackImage: series.fallbackImage,
    }));
  }

  if (seriesId === "diramix-for-the-fans") {
    return diramixForTheFansCards.map((card) => ({
      ...card,
      frontImage: `${baseFolder}/${card.code}.webp`,
      backImage: series.coverImage,
      fallbackImage: series.coverImage,
      finalFallbackImage: series.fallbackImage,
    }));
  }

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

  if (seriesId === "kayou-energy-series-1") {
    return kayouEnergySeries1Cards.map((card, index) => ({
      ...card,
      number: index + 1,
      frontImage: `${baseFolder}/${card.code}.webp`,
      backImage: series.coverImage,
      fallbackImage: series.coverImage,
      finalFallbackImage: series.fallbackImage,
    }));
  }

  if (seriesId === "kayou-mini-series-1") {
    return kayouMiniSeries1Cards.map((card, index) => ({
      ...card,
      number: index + 1,
      frontImage: `${baseFolder}/${card.code}.webp`,
      backImage: series.coverImage,
      fallbackImage: series.coverImage,
      finalFallbackImage: series.fallbackImage,
    }));
  }

  if (seriesId === "mcdonalds-photocards") {
    return mcdonaldsPhotocards.map((card, index) => ({
      ...card,
      number: index + 1,
      rarity: "promo",
      frontImage: `${baseFolder}/${card.id}.webp`,
      backImage: series.coverImage,
      fallbackImage: series.coverImage,
      finalFallbackImage: series.fallbackImage,
    }));
  }

  return [];
};
