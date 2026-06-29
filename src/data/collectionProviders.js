import { getPokemonSetById, getPokemonSets } from "../services/pokemonService";

export const collectionProviders = {
  pokemon: {
    id: "pokemon",
    label: "Pokémon TCG",
    getSets: getPokemonSets,
    getSetById: getPokemonSetById,
  },
};
