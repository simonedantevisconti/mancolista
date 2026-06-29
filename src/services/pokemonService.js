import { tcgdexEn, tcgdexIt } from "../api/tcgdexClient";

const getCardImageUrl = (image) => {
  if (!image) return null;

  if (
    image.endsWith(".png") ||
    image.endsWith(".webp") ||
    image.endsWith(".jpg")
  ) {
    return image;
  }

  return `${image}/high.webp`;
};

const getSetAssetUrl = (asset) => {
  if (!asset) return null;

  if (
    asset.endsWith(".png") ||
    asset.endsWith(".webp") ||
    asset.endsWith(".jpg")
  ) {
    return asset;
  }

  return `${asset}.webp`;
};

const getLocalSetCover = (setId) => {
  return `/pokemon/sets/${setId}.png`;
};

const normalizeSet = (set) => {
  return {
    id: set.id,
    name: set.name,
    logo: getSetAssetUrl(set.logo),
    symbol: getSetAssetUrl(set.symbol),
    cover: getLocalSetCover(set.id),
    cardCount: set.cardCount?.total ?? set.cardCount?.official ?? 0,
  };
};

const normalizeCards = (cards = []) => {
  return cards.map((card) => ({
    id: card.id,
    localId: card.localId,
    number: card.localId,
    name: card.name || "Carta senza nome",
    image: getCardImageUrl(card.image),
    rarity: card.rarity ?? "",
  }));
};

export const getPokemonSets = async () => {
  const italianSets = await tcgdexIt.set.list();

  return italianSets.map(normalizeSet).filter((set) => {
    return set.cardCount > 0;
  });
};

export const getPokemonSetById = async (setId) => {
  const italianSet = await tcgdexIt.set.get(setId);
  const italianCards = normalizeCards(italianSet.cards);

  if (italianCards.length > 0) {
    return {
      ...normalizeSet(italianSet),
      cards: italianCards,
      languageUsed: "it",
    };
  }

  const englishSet = await tcgdexEn.set.get(setId);
  const englishCards = normalizeCards(englishSet.cards);

  return {
    ...normalizeSet(englishSet),
    cards: englishCards,
    languageUsed: "en",
  };
};

export const getPokemonCardById = async (cardId) => {
  try {
    const italianCard = await tcgdexIt.card.get(cardId);

    if (italianCard) {
      return {
        id: italianCard.id,
        localId: italianCard.localId,
        name: italianCard.name,
        image: getCardImageUrl(italianCard.image),
        rarity: italianCard.rarity ?? "Non indicata",
        category: italianCard.category ?? "",
        illustrator: italianCard.illustrator ?? "",
        set: italianCard.set
          ? {
              id: italianCard.set.id,
              name: italianCard.set.name,
            }
          : null,
      };
    }
  } catch (error) {
    console.warn("Carta non trovata in italiano, provo in inglese:", error);
  }

  const englishCard = await tcgdexEn.card.get(cardId);

  return {
    id: englishCard.id,
    localId: englishCard.localId,
    name: englishCard.name,
    image: getCardImageUrl(englishCard.image),
    rarity: englishCard.rarity ?? "Non indicata",
    category: englishCard.category ?? "",
    illustrator: englishCard.illustrator ?? "",
    set: englishCard.set
      ? {
          id: englishCard.set.id,
          name: englishCard.set.name,
        }
      : null,
  };
};
