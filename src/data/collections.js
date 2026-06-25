import { italianBrainrotCards } from "./italianBrainrotCards";

export const mainCollections = [
  {
    id: "italian-brainrot",
    name: "Italian Brainrot",
    description: "Collezione principale con le serie Alpha, Beta e Gamma.",
    totalCards: 450,
    ownedCards: 0,
    active: true,
    logo: "/loghi/italian-brainrot.jpg",
  },
  {
    id: "pokemon",
    name: "Pokemon",
    description: "Carte collezionabili Pokemon",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/pokemon-logo.jpg",
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
    id: "star-wars-unlimited",
    name: "Star Wars: Unlimited",
    description: "Carte collezionabili Star Wars: Unlimited.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/star-wars-logo.avif",
  },
  {
    id: "magic-the-gathering",
    name: "Magic: The Gathering",
    description: "Carte collezionabili Magic: The Gathering.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/magic-logo.png",
  },
  {
    id: "flesh-and-blood",
    name: "Flesh and Blood",
    description: "Carte collezionabili Flesh and Blood.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/flesh-and-blood-logo.jpg",
  },
  {
    id: "digimon-card-game",
    name: "Digimon Card Game",
    description: "Carte collezionabili Digimon Card Game.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/digimon-logo.png",
  },
  {
    id: "hearthstone",
    name: "Hearthstone",
    description: "Carte collezionabili Hearthstone.",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/hearthstone-logo.png",
  },
  {
    id: "yu-gi-oh",
    name: "Yu-Gi-Oh!",
    description: "Carte collezionabili Yu-Gi-Oh!",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/yu-gi-oh-logo.png",
  },
  {
    id: "vanguard",
    name: "Vanguard",
    description: "Carte collezionabili Vanguard",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/vanguard-logo.png",
  },
  {
    id: "duel-master",
    name: "Duel Master",
    description: "Carte collezionabili Duel Master",
    totalCards: 0,
    ownedCards: 0,
    active: false,
    logo: "/loghi/duel-master-logo.jpg",
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
        ? `/${imageFolder}/${number}.png`
        : "/fronte.webp",

      backImage: "/retro.webp",
    };
  });
};
