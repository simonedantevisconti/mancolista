export const snoopy2026Series = [
  {
    id: "sticker-album",
    name: "Sticker Album",
    subtitle: "Un anno da ricordare",
    totalCards: 276,
  },
  {
    id: "limited-edition",
    name: "Cutout Memories",
    subtitle: "Card Limited Edition",
    totalCards: 10,
  },
];

const limitedEditionCards = [
  { number: "LE1", name: "Charlie Brown & Lucy - Aaugh!" },
  { number: "LE2", name: "Peppermint Patty - I'm Awake" },
  { number: "LE3", name: "Linus & Snoopy - Watch It, Beagle!" },
  { number: "LE4", name: "Snoopy on Typewriter - The Dog" },
  { number: "LE5", name: "Snoopy & Charlie Brown" },
  { number: "LE6", name: "Snoopy with Sunglasses - Joe Cool" },
  { number: "LE7", name: "Snoopy Astronaut" },
  { number: "LE8", name: "Snoopy Aviator" },
  { number: "LE9", name: "Snoopy Dracula" },
  { number: "LE10", name: "Snoopy Park Ranger" },
];

const generateStickerAlbumCards = () => {
  const numberedCards = Array.from({ length: 260 }, (_, index) => {
    const number = index + 1;

    return {
      id: `sticker-${number}`,
      number: String(number),
      name: `Figurina ${number}`,
      category: "album",
      frontImage: "/retro.webp",
      backImage: "/retro.webp",
    };
  });

  const posterCards = Array.from({ length: 16 }, (_, index) => {
    const number = `X${index + 1}`;

    return {
      id: `sticker-${number.toLowerCase()}`,
      number,
      name: `Figurina ${number}`,
      category: "poster",
      frontImage: "/retro.webp",
      backImage: "/retro.webp",
    };
  });

  return [...numberedCards, ...posterCards];
};

export const generateSnoopy2026Cards = (seriesId) => {
  if (seriesId === "sticker-album") {
    return generateStickerAlbumCards();
  }

  if (seriesId === "limited-edition") {
    return limitedEditionCards.map((card) => ({
      id: card.number.toLowerCase(),
      number: card.number,
      name: card.name,
      category: "limited-edition",
      frontImage: "/retro.webp",
      backImage: "/retro.webp",
    }));
  }

  return [];
};
