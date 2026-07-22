import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicDirectory = path.join(projectRoot, "public");
const sourceImage = path.join(publicDirectory, "mancolista-logo.webp");

const icons = [
  {
    filename: "pwa-192x192.png",
    size: 192,
  },
  {
    filename: "pwa-512x512.png",
    size: 512,
  },
  {
    filename: "pwa-maskable-512x512.png",
    size: 512,
    maskable: true,
  },
  {
    filename: "apple-touch-icon.png",
    size: 180,
  },
  {
    filename: "favicon-32x32.png",
    size: 32,
  },
];

const generateIcon = async ({ filename, size, maskable = false }) => {
  const outputPath = path.join(publicDirectory, filename);

  const logoSize = maskable ? Math.round(size * 0.72) : Math.round(size * 0.86);

  const logoBuffer = await sharp(sourceImage)
    .resize(logoSize, logoSize, {
      fit: "contain",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: {
        r: 255,
        g: 122,
        b: 0,
        alpha: 1,
      },
    },
  })
    .composite([
      {
        input: logoBuffer,
        gravity: "center",
      },
    ])
    .png({
      compressionLevel: 9,
    })
    .toFile(outputPath);

  console.log(`Creata: public/${filename}`);
};

const run = async () => {
  try {
    await fs.access(sourceImage);
  } catch {
    throw new Error(
      "Immagine sorgente non trovata: public/mancolista-logo.webp",
    );
  }

  for (const icon of icons) {
    await generateIcon(icon);
  }

  console.log("");
  console.log("Icone PWA generate correttamente.");
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
