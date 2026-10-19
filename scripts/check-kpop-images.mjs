import fs from "node:fs/promises";
import path from "node:path";
import {
  diramixOfficialCards,
  diramixForTheFansCards,
  kayouClassicSeries1Cards,
  kayouEnergySeries1Cards,
  kayouMiniSeries1Cards,
  mcdonaldsPhotocards,
} from "../src/data/kpopDemonHuntersCards.js";

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, "public", "kpop-demon-hunters");

const sets = [
  {
    id: "diramix-official",
    label: "Diramix Official",
    cards: diramixOfficialCards,
    fileName: (card) => `${card.code}.webp`,
    optional: true,
  },
  {
    id: "diramix-for-the-fans",
    label: "Diramix For The Fans",
    cards: diramixForTheFansCards,
    fileName: (card) => `${card.code}.webp`,
    optional: true,
  },
  {
    id: "kayou-classic-series-1",
    label: "KAYOU Classic",
    cards: kayouClassicSeries1Cards,
    fileName: (card) => `${card.code}.webp`,
  },
  {
    id: "kayou-energy-series-1",
    label: "KAYOU Energy",
    cards: kayouEnergySeries1Cards,
    fileName: (card) => `${card.code}.webp`,
  },
  {
    id: "kayou-mini-series-1",
    label: "KAYOU Mini",
    cards: kayouMiniSeries1Cards,
    fileName: (card) => `${card.code}.webp`,
  },
  {
    id: "mcdonalds-photocards",
    label: "McDonald's Italia",
    cards: mcdonaldsPhotocards,
    fileName: (card) => `${card.id}.webp`,
  },
];

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  let requiredMissing = 0;

  console.log("\n=== Verifica immagini K-Pop Demon Hunters ===\n");

  for (const set of sets) {
    const setDir = path.join(BASE_DIR, set.id);
    const missing = [];

    for (const card of set.cards) {
      const file = set.fileName(card);
      const filePath = path.join(setDir, file);

      if (!(await exists(filePath))) {
        missing.push(file);
      }
    }

    const present = set.cards.length - missing.length;
    const marker = missing.length === 0 ? "OK" : set.optional ? "INFO" : "ERR";

    console.log(
      `[${marker}] ${set.label}: ${present}/${set.cards.length} immagini presenti`,
    );

    if (missing.length > 0) {
      const preview = missing.slice(0, 20).join(", ");
      console.log(
        `      Mancanti: ${preview}${missing.length > 20 ? ", ..." : ""}`,
      );
    }

    if (!set.optional) {
      requiredMissing += missing.length;
    }
  }

  console.log("");

  if (requiredMissing > 0) {
    console.error(
      `Verifica fallita: mancano ${requiredMissing} immagini nelle collezioni complete.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log("Verifica completata: tutte le collezioni complete hanno le immagini richieste.");
};

main().catch((error) => {
  console.error(`[FATAL] ${error.message}`);
  process.exitCode = 1;
});
