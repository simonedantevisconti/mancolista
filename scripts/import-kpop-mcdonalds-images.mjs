import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { mcdonaldsPhotocards } from "../src/data/kpopDemonHuntersCards.js";

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "imports", "kpop-mcdonalds");
const OUTPUT_DIR = path.join(
  ROOT,
  "public",
  "kpop-demon-hunters",
  "mcdonalds-photocards",
);

const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

const findInputFile = async (card, index) => {
  const candidates = [
    card.id,
    String(index + 1),
    String(index + 1).padStart(2, "0"),
  ];

  for (const baseName of candidates) {
    for (const extension of supportedExtensions) {
      const candidate = path.join(INPUT_DIR, `${baseName}${extension}`);

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

const main = async () => {
  await fs.mkdir(INPUT_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let converted = 0;
  let skipped = 0;
  let invalid = 0;
  const missing = [];

  for (let index = 0; index < mcdonaldsPhotocards.length; index += 1) {
    const card = mcdonaldsPhotocards[index];
    const outputPath = path.join(OUTPUT_DIR, `${card.id}.webp`);

    try {
      await fs.access(outputPath);
      console.log(`[SKIP] ${card.name} → ${card.id}.webp`);
      skipped += 1;
      continue;
    } catch {
      // Il file di destinazione non esiste ancora.
    }

    const inputPath = await findInputFile(card, index);

    if (!inputPath) {
      missing.push({
        number: index + 1,
        id: card.id,
        name: card.name,
      });
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
        `[OK] ${path.basename(inputPath)} [${metadata.format}] → ${card.id}.webp (${card.name})`,
      );
      converted += 1;
    } catch (error) {
      console.error(
        `[ERR] ${path.basename(inputPath)} — ${card.name}: ${error.message}`,
      );
      invalid += 1;
    }
  }

  console.log(
    `\nCompletato. Convertite: ${converted}. Già presenti: ${skipped}. Mancanti: ${missing.length}. Non valide: ${invalid}.`,
  );

  if (missing.length > 0) {
    console.log("\nImmagini ancora da aggiungere in imports/kpop-mcdonalds:");

    for (const card of missing) {
      console.log(
        `  ${String(card.number).padStart(2, "0")} — ${card.name} → ${card.id}.[jpg|png|webp]`,
      );
    }

  }

  if (missing.length > 0 || invalid > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(`[FATAL] ${error.message}`);
  process.exitCode = 1;
});
