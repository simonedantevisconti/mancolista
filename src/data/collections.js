import { italianBrainrotCards } from "./italianBrainrotCards";

export const mainCollections = [
  {
    id: "italian-brainrot",
    name: "Italian Brainrot",
    description:
      "Universo Psichedelico, Allucinazione Cosmica e Anomalia Galattica.",
    totalCards: 450,
    ownedCards: 0,
    active: true,
    logo: "/loghi/italian-brainrot.jpg",
    type: "static-series",
    provider: "italian-brainrot",
  },
  {
    id: "calciatori-panini-2027",
    name: "Calciatori Panini 2027",
    description: "Album Calciatori Panini 2027.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/calciatori-panini-2027.webp",
  },
  {
    id: "disney-lorcana",
    name: "Disney Lorcana",
    description: "Carte collezionabili Disney Lorcana.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/disney-logo.png",
  },
  {
    id: "one-piece-card-game",
    name: "One Piece Card Game",
    description: "Carte collezionabili One Piece Card Game.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/one-piece-logo.png",
  },
  {
    id: "mondiali-2026",
    name: "Mondiali 2026",
    description: "Collezione dedicata ai Mondiali 2026.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/mondiali-2026.webp",
  },
  {
    id: "poppy-playtime",
    name: "Poppy Playtime",
    description: "Collezione Poppy Playtime.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/poppy-playtime.webp",
  },
  {
    id: "squishy-dumpling",
    name: "Squishy Dumpling",
    description: "Collezione Squishy Dumpling.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/squishy-dumpling.webp",
  },
  {
    id: "snoopy-un-anno-da-ricordare-2026",
    name: "Snoopy - Un anno da ricordare 2026",
    description: "Collezione Snoopy - Un anno da ricordare 2026.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/peanuts-un-anno-da-ricordare.webp",
  },
  {
    id: "k-pop-demon-hunters",
    name: "K-Pop Demon Hunters",
    description: "Collezione K-Pop Demon Hunters.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/k-pop-demon-hunter.webp",
  },
  {
    id: "pokemon-prima-edizione",
    name: "Pokémon - Prima Edizione",
    description: "Collezione Pokémon Prima Edizione.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/mancolista-logo.webp",
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

const seriesImageFolders = {
  alpha: "universo-psichedelico",
  beta: "allucinazione-cosmica",
  gamma: "anomalia-galattica",
};

export const generateBrainrotCards = (seriesId) => {
  const imageFolder = seriesImageFolders[seriesId];
  const realCards = italianBrainrotCards[seriesId] || [];

  return Array.from({ length: 150 }, (_, index) => {
    const number = index + 1;

    const realCard = realCards.find((card) => {
      return card.number === number;
    });

    return {
      id: `${seriesId}-${number}`,
      number,
      name: realCard?.name || `Carta #${String(number).padStart(3, "0")}`,
      rarity: realCard?.rarity || "da-verificare",

      frontImage: imageFolder
        ? `/${imageFolder}/${number}.webp`
        : "/fronte.webp",

      backImage: "/retro.webp",
    };
  });
};
