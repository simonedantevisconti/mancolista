import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicDirectory = path.join(projectRoot, "public");

const foldersToConvert = [
  "universo-psichedelico",
  "allucinazione-cosmica",
  "anomalia-galattica",
  "album",
];

const singleFilesToConvert = ["mancolista-logo.png"];

const supportedExtensions = new Set([".png", ".jpg", ".jpeg"]);

const getFilesRecursively = async (directory) => {
  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await getFilesRecursively(entryPath);
      files.push(...nestedFiles);
      continue;
    }

    files.push(entryPath);
  }

  return files;
};

const convertFile = async (inputPath) => {
  const extension = path.extname(inputPath).toLowerCase();

  if (!supportedExtensions.has(extension)) {
    return null;
  }

  const outputPath = inputPath.replace(/\.(png|jpe?g)$/i, ".webp");

  if (outputPath === inputPath) {
    return null;
  }

  const inputStats = await fs.stat(inputPath);

  await sharp(inputPath)
    .webp({
      quality: 82,
      effort: 5,
    })
    .toFile(outputPath);

  const outputStats = await fs.stat(outputPath);

  return {
    inputPath,
    outputPath,
    originalBytes: inputStats.size,
    convertedBytes: outputStats.size,
  };
};

const formatMegabytes = (bytes) => {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const run = async () => {
  const filesToConvert = [];

  for (const folder of foldersToConvert) {
    const folderPath = path.join(publicDirectory, folder);

    try {
      const files = await getFilesRecursively(folderPath);
      filesToConvert.push(...files);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.warn(`Cartella non trovata: ${folderPath}`);
        continue;
      }

      throw error;
    }
  }

  for (const filename of singleFilesToConvert) {
    filesToConvert.push(path.join(publicDirectory, filename));
  }

  let originalTotal = 0;
  let convertedTotal = 0;
  let convertedCount = 0;

  for (const filePath of filesToConvert) {
    try {
      const result = await convertFile(filePath);

      if (!result) {
        continue;
      }

      originalTotal += result.originalBytes;
      convertedTotal += result.convertedBytes;
      convertedCount += 1;

      console.log(
        `${path.relative(publicDirectory, result.inputPath)} → ${path.relative(
          publicDirectory,
          result.outputPath,
        )}`,
      );
    } catch (error) {
      console.error(`Errore nella conversione di ${filePath}:`, error.message);
    }
  }

  const savedBytes = originalTotal - convertedTotal;
  const savingPercentage =
    originalTotal > 0 ? (savedBytes / originalTotal) * 100 : 0;

  console.log("");
  console.log(`Immagini convertite: ${convertedCount}`);
  console.log(`Peso originale: ${formatMegabytes(originalTotal)}`);
  console.log(`Peso WebP: ${formatMegabytes(convertedTotal)}`);
  console.log(`Risparmio: ${formatMegabytes(savedBytes)}`);
  console.log(`Riduzione: ${savingPercentage.toFixed(1)}%`);
};

run().catch((error) => {
  console.error("Conversione interrotta:", error);
  process.exitCode = 1;
});
