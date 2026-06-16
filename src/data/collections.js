export const mainCollections = [
  {
    id: "italian-brainrot",
    name: "Italian Brainrot",
    description:
      "Tieni traccia delle carte che hai, delle doppie e delle mancanti.",
    totalCards: 450,
    ownedCards: 0,
    icon: "🧠",
    active: true,
  },
  {
    id: "disney-lorcana",
    name: "Disney Lorcana",
    description: "Collezione futura per Disney Lorcana.",
    totalCards: 0,
    ownedCards: 0,
    icon: "🏰",
    active: false,
  },
  {
    id: "one-piece-card-game",
    name: "One Piece Card Game",
    description: "Collezione futura per One Piece Card Game.",
    totalCards: 0,
    ownedCards: 0,
    icon: "🏴‍☠️",
    active: false,
  },
  {
    id: "star-wars-unlimited",
    name: "Star Wars: Unlimited",
    description: "Collezione futura per Star Wars: Unlimited.",
    totalCards: 0,
    ownedCards: 0,
    icon: "🚀",
    active: false,
  },
  {
    id: "magic-the-gathering",
    name: "Magic The Gathering",
    description: "Collezione futura per Magic The Gathering.",
    totalCards: 0,
    ownedCards: 0,
    icon: "🧙",
    active: false,
  },
  {
    id: "flesh-and-blood",
    name: "Flesh and Blood",
    description: "Collezione futura per Flesh and Blood.",
    totalCards: 0,
    ownedCards: 0,
    icon: "⚔️",
    active: false,
  },
  {
    id: "digimon-card-game",
    name: "Digimon Card Game",
    description: "Collezione futura per Digimon Card Game.",
    totalCards: 0,
    ownedCards: 0,
    icon: "🔥",
    active: false,
  },
  {
    id: "hearthstone",
    name: "Hearthstone",
    description: "Collezione futura per Hearthstone.",
    totalCards: 0,
    ownedCards: 0,
    icon: "💎",
    active: false,
  },
];

export const italianBrainrotSeries = [
  {
    id: "alpha",
    name: "Serie Alpha",
    subtitle: "Universo Psichedelico",
    totalCards: 150,
    ownedCards: 0,
  },
  {
    id: "beta",
    name: "Serie Beta",
    subtitle: "Allucinazione Cosmica",
    totalCards: 150,
    ownedCards: 0,
  },
  {
    id: "gamma",
    name: "Serie Gamma",
    subtitle: "Anomalia Galattica",
    totalCards: 150,
    ownedCards: 0,
  },
];

const rarities = ["Comune", "Non Comune", "Rara", "Epica", "Leggendaria"];

export const generateBrainrotCards = (seriesId) => {
  const seriesMap = {
    alpha: "Alpha",
    beta: "Beta",
    gamma: "Gamma",
  };

  const seriesName = seriesMap[seriesId] || "Alpha";

  return Array.from({ length: 150 }, (_, index) => {
    const number = index + 1;

    return {
      id: `${seriesId}-${number}`,
      number,
      name: `Brainrot ${seriesName} #${String(number).padStart(3, "0")}`,
      rarity: rarities[index % rarities.length],
      frontImage: "/fronte.webp",
      backImage: "/retro.webp",
    };
  });
};
