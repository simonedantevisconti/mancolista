import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { kayouMiniSeries1Cards } from "../src/data/kpopDemonHuntersCards.js";

const SOURCE_URL =
  "https://www.kayouofficial.com/en-US/series/series-9g41nnu1";

const OUTPUT_DIR = path.join(
  process.cwd(),
  "public",
  "kpop-demon-hunters",
  "kayou-mini-series-1",
);

const decodeHtml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&#x2F;", "/")
    .replaceAll("&#47;", "/");

const normalizeLabel = (value) =>
  value
    .toLowerCase()
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();

const extractCardImages = (html) => {
  const imageRegex = /<img\b[^>]*>/gi;
  const images = [];

  for (const match of html.matchAll(imageRegex)) {
    const tag = match[0];
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);

    if (!srcMatch) continue;

    const src = decodeHtml(srcMatch[1]);
    const alt = decodeHtml(altMatch?.[1] || "").trim();

    if (!src.includes("static-sg.kayouofficial.com")) continue;
    if (!alt) continue;

    images.push({ src, alt });
  }

  const selected = [];
  let cursor = 0;

  for (const card of kayouMiniSeries1Cards) {
    const expected = normalizeLabel(card.name);
    let foundIndex = -1;

    for (let index = cursor; index < images.length; index += 1) {
      if (normalizeLabel(images[index].alt) === expected) {
        foundIndex = index;
        break;
      }
    }

    if (foundIndex === -1) {
      throw new Error(
        `Immagine non trovata in ordine per ${card.code} — ${card.name}`,
      );
    }

    selected.push(images[foundIndex]);
    cursor = foundIndex + 1;
  }

  return selected;
};

const downloadImage = async (url, outputPath) => {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; MancoLista/1.0; +https://mancolista.site/)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  await sharp(buffer)
    .webp({ quality: 88 })
    .toFile(outputPath);
};

const main = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const pageResponse = await fetch(SOURCE_URL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; MancoLista/1.0; +https://mancolista.site/)",
    },
  });

  if (!pageResponse.ok) {
    throw new Error(`Pagina KAYOU non disponibile: HTTP ${pageResponse.status}`);
  }

  const html = await pageResponse.text();
  const images = extractCardImages(html);

  if (images.length !== kayouMiniSeries1Cards.length) {
    throw new Error(
      `Abbinate ${images.length} immagini card, attese ${kayouMiniSeries1Cards.length}. Download annullato per evitare abbinamenti errati.`,
    );
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < kayouMiniSeries1Cards.length; index += 1) {
    const card = kayouMiniSeries1Cards[index];
    const image = images[index];
    const outputPath = path.join(OUTPUT_DIR, `${card.code}.webp`);

    try {
      await fs.access(outputPath);
      console.log(`[SKIP] ${card.code} — ${card.name}`);
      skipped += 1;
      continue;
    } catch {
      // Il file non esiste ancora.
    }

    try {
      await downloadImage(image.src, outputPath);
      console.log(
        `[OK] ${card.code} — ${card.name} ← ${image.alt}`,
      );
      downloaded += 1;
    } catch (error) {
      console.error(`[ERR] ${card.code}: ${error.message}`);
      failed += 1;
    }
  }

  console.log(
    `\nCompletato. Scaricate: ${downloaded}. Già presenti: ${skipped}. Errori: ${failed}.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(`[FATAL] ${error.message}`);
  process.exitCode = 1;
});
