import { tcgdex } from "../api/tcgdexClient";

const getCardImageUrl = (image) => {
  if (!image) return null;
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

export const getPokemonSets = async () => {
  const sets = await tcgdex.set.list();

  return sets.map((set) => ({
    id: set.id,
    name: set.name,
    logo: getSetAssetUrl(set.logo),
    symbol: getSetAssetUrl(set.symbol),
    cover: getLocalSetCover(set.id),
    cardCount: set.cardCount?.total ?? set.cardCount?.official ?? 0,
  }));
};

export const getPokemonSetById = async (setId) => {
  const set = await tcgdex.set.get(setId);

  return {
    id: set.id,
    name: set.name,
    logo: getSetAssetUrl(set.logo),
    symbol: getSetAssetUrl(set.symbol),
    cover: getLocalSetCover(set.id),
    cardCount: set.cardCount?.total ?? set.cardCount?.official ?? 0,
    cards: (set.cards ?? []).map((card) => ({
      id: card.id,
      localId: card.localId,
      name: card.name,
      image: getCardImageUrl(card.image),
      rarity: card.rarity ?? "",
    })),
  };
};

export const getPokemonCardById = async (cardId) => {
  const card = await tcgdex.card.get(cardId);

  return {
    id: card.id,
    localId: card.localId,
    name: card.name,
    image: getCardImageUrl(card.image),
    rarity: card.rarity ?? "Non indicata",
    category: card.category ?? "",
    illustrator: card.illustrator ?? "",
    set: card.set
      ? {
          id: card.set.id,
          name: card.set.name,
        }
      : null,
  };
};
