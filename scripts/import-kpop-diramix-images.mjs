import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  diramixOfficialCards,
  diramixForTheFansCards,
} from "../src/data/kpopDemonHuntersCards.js";

const ROOT = process.cwd();

const SETS = [
  {
    id: "diramix-official",
    label: "Diramix Official Sticker Collection",
    cards: diramixOfficialCards,
    inputDir: path.join(ROOT, "imports", "kpop-diramix", "official"),
  },
  {
    id: "diramix-for-the-fans",
    label: "Diramix For The Fans",
    cards: diramixForTheFansCards,
    inputDir: path.join(ROOT, "imports", "kpop-diramix", "for-the-fans"),
  },
];

const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

const findInputFile = async (inputDir, card) => {
  const candidates = [
    card.code,
    String(card.number),
    String(card.number).padStart(2, "0"),
    String(card.number).padStart(3, "0"),
  ];

  for (const baseName of candidates) {
    for (const extension of supportedExtensions) {
      const candidate = path.join(inputDir, `${baseName}${extension}`);

      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // Prova il nome successivo.
      }
    }
  }

  return null;
};

const processSet = async (set) => {
  const outputDir = path.join(
    ROOT,
    "public",
    "kpop-demon-hunters",
    set.id,
  );

  await fs.mkdir(set.inputDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  let converted = 0;
  let skipped = 0;
  let invalid = 0;
  const missing = [];

  console.log(`\n=== ${set.label} ===`);

  for (const card of set.cards) {
    const outputPath = path.join(outputDir, `${card.code}.webp`);

    try {
      await fs.access(outputPath);
      skipped += 1;
      continue;
    } catch {
      // Non ancora presente.
    }

    const inputPath = await findInputFile(set.inputDir, card);

    if (!inputPath) {
      missing.push(card);
      continue;
    }

    try {
      const metadata = await sharp(inputPath).metadata();

      if (!metadata.format) {
        throw new Error("formato immagine non riconosciuto");
      }

      await sharp(inputPath)
        .rotate()
        .webp({ quality: 88 })
        .toFile(outputPath);

      console.log(
        `[OK] ${path.basename(inputPath)} → ${card.code}.webp`,
      );
      converted += 1;
    } catch (error) {
      console.error(
        `[ERR] ${path.basename(inputPath)} — ${card.code}: ${error.message}`,
      );
      invalid += 1;
    }
  }

  console.log(
    `Completato ${set.id}. Convertite: ${converted}. Già presenti: ${skipped}. Mancanti: ${missing.length}. Non valide: ${invalid}.`,
  );

  if (missing.length > 0) {
    const preview = missing.slice(0, 20).map((card) => card.code).join(", ");
    console.log(
      `Mancano: ${preview}${missing.length > 20 ? ", ..." : ""}`,
    );
  }

  return { converted, skipped, invalid, missing: missing.length };
};

const main = async () => {
  let failed = false;

  for (const set of SETS) {
    const result = await processSet(set);

    if (result.invalid > 0 || result.missing > 0) {
      failed = true;
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(`[FATAL] ${error.message}`);
  process.exitCode = 1;
});
