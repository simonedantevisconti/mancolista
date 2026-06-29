import TCGdex from "@tcgdex/sdk";

export const tcgdexIt = new TCGdex("it");
export const tcgdexEn = new TCGdex("en");

// Compatibilità con il codice già esistente
export const tcgdex = tcgdexIt;
