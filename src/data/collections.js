import { italianBrainrotCards } from "./italianBrainrotCards";
import { squishyDumplingCards } from "./squishyDumplingCards";

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
    id: "calciatori-panini-2026-2027",
    name: "Calciatori Panini 2026-2027",
    description: "Album ufficiale Calciatori Panini 2026-2027.",
    totalCards: 609,
    ownedCards: 0,
    active: true,
    logo: "/calciatori-panini-26-27.jpg",
    type: "static-single",
    provider: "calciatori-panini-2026-2027",
  },
  {
    id: "disney-lorcana",
    name: "Disney Lorcana",
    description: "Tutte le quattordici espansioni Disney Lorcana configurate.",
    totalCards: 2860,
    ownedCards: 0,
    active: true,
    logo: "/loghi/disney-logo.png",
    type: "static-single",
    provider: "disney-lorcana",
  },
  {
    id: "one-piece-card-game",
    name: "One Piece Card Game",
    description: "Prime dodici espansioni One Piece Card Game già configurate.",
    totalCards: 1436,
    ownedCards: 0,
    active: true,
    logo: "/loghi/one-piece-logo.png",
    type: "static-series",
    provider: "one-piece-card-game",
  },
  {
    id: "mondiali-2026",
    name: "FIFA World Cup 2026 Panini",
    description: "Official Sticker Collection e Update Edition.",
    totalCards: 1100,
    ownedCards: 0,
    active: true,
    logo: "/loghi/mondiali-2026.webp",
    type: "static-series",
    provider: "world-cup-2026",
  },
  {
    id: "poppy-playtime",
    name: "Poppy Playtime",
    description: "Official Card Collection da 162 card.",
    totalCards: 162,
    ownedCards: 0,
    active: true,
    logo: "/loghi/poppy-playtime.webp",
    type: "static-single",
    provider: "poppy-playtime",
  },
  {
    id: "squishy-dumpling",
    name: "Squishy Dumpling",
    description: "Collezione Squishy Dumpling da 135 carte.",
    totalCards: 135,
    ownedCards: 0,
    active: true,
    logo: "/loghi/squishy-dumpling.webp",
    type: "static-single",
    provider: "squishy-dumpling",
  },
  {
    id: "snoopy-un-anno-da-ricordare-2026",
    name: "Snoopy - Un anno da ricordare 2026",
    description: "Sticker Album da 276 figurine e 10 Card Limited Edition.",
    totalCards: 286,
    ownedCards: 0,
    active: true,
    logo: "/loghi/peanuts-un-anno-da-ricordare.webp",
    type: "static-series",
    provider: "snoopy-2026",
  },
  {
    id: "k-pop-demon-hunters",
    name: "K-Pop Demon Hunters",
    description:
      "Diramix, KAYOU e photocards promozionali McDonald's.",
    totalCards: 673,
    ownedCards: 0,
    active: true,
    logo: "/loghi/k-pop-demon-hunter.webp",
    type: "static-series",
    provider: "kpop-demon-hunters",
  },
  {
    id: "pokemon-prima-edizione",
    name: "Pokémon - Prima Edizione",
    description: "Base Set Pokémon da 102 carte.",
    totalCards: 102,
    ownedCards: 0,
    active: true,
    logo: "/loghi/pokemon.webp",
    type: "static-single",
    provider: "pokemon-prima-edizione",
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

export const generateSquishyDumplingCards = () => {
  return squishyDumplingCards.map((card) => {
    return {
      id: `squishy-dumpling-${card.number}`,
      number: card.number,
      name: card.name || `Card ${card.number}`,
      rarity: card.rarity || "da-verificare",
      frontImage: "/squishy-retro.webp",
      backImage: "/squishy-retro.webp",
    };
  });
};
