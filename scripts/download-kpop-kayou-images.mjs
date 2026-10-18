import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  kayouClassicSeries1Cards,
  kayouEnergySeries1Cards,
} from "../src/data/kpopDemonHuntersCards.js";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public", "kpop-demon-hunters");

const sets = [
  {
    id: "kayou-classic-series-1",
    pagePrefix: "kayou-kpdh-classic-001-na",
    cards: kayouClassicSeries1Cards,
  },
  {
    id: "kayou-energy-series-1",
    pagePrefix: "kayou-kpdh-energy-001-na",
    cards: kayouEnergySeries1Cards,
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractImageUrl = (html) => {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<img[^>]+src=["']([^"']+)["'][^>]+alt=["'][^"']*KAYOU[^"']*["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].replaceAll("&amp;", "&");
  }

  return null;
};

const buildCardPageUrl = (pagePrefix, code) => {
  const codeTail = code
    .replace(/^KPDH01-/, "")
    .toLowerCase();

  return `https://goldentcg.app/cards/${pagePrefix}-${codeTail}`;
};

const downloadCard = async ({ set, card }) => {
  const outputDir = path.join(PUBLIC_DIR, set.id);
  const outputPath = path.join(outputDir, `${card.code}.webp`);

  await fs.mkdir(outputDir, { recursive: true });

  try {
    await fs.access(outputPath);
    console.log(`[SKIP] ${card.code}`);
    return;
  } catch {
    // File non presente: continua con il download.
  }

  const pageUrl = buildCardPageUrl(set.pagePrefix, card.code);
  const pageResponse = await fetch(pageUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; MancoLista/1.0; +https://mancolista.site/)",
    },
  });

  if (!pageResponse.ok) {
    throw new Error(
      `Pagina non disponibile per ${card.code}: HTTP ${pageResponse.status}`,
    );
  }

  const html = await pageResponse.text();
  const imageUrl = extractImageUrl(html);

  if (!imageUrl) {
    throw new Error(`Immagine non trovata nella pagina di ${card.code}`);
  }

  const imageResponse = await fetch(imageUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; MancoLista/1.0; +https://mancolista.site/)",
    },
  });

  if (!imageResponse.ok) {
    throw new Error(
      `Download immagine fallito per ${card.code}: HTTP ${imageResponse.status}`,
    );
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());

  await sharp(buffer)
    .webp({ quality: 86 })
    .toFile(outputPath);

  console.log(`[OK] ${card.code} → ${outputPath}`);
};

const main = async () => {
  let downloaded = 0;
  let failed = 0;

  for (const set of sets) {
    console.log(`\n=== ${set.id} ===`);

    for (const card of set.cards) {
      try {
        await downloadCard({ set, card });
        downloaded += 1;
      } catch (error) {
        failed += 1;
        console.error(`[ERR] ${card.code}: ${error.message}`);
      }

      await sleep(120);
    }
  }

  console.log(
    `\nCompletato. Elaborate: ${downloaded}. Errori: ${failed}.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
};

main();
