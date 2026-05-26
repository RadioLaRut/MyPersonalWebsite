import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

sharp.cache({ files: 0 });
sharp.concurrency(1);

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const PUBLIC_DIR = path.join(projectRoot, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const SRC_DIR = path.join(projectRoot, "src");
const CONTENT_DIR = path.join(projectRoot, "content");
const QUALITY = 85;
const EFFORT = 6;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 250;
const SKIP_FILES = new Set(["placeholder-16-9-1772675072147-5143c516.jpg"]);
const CODE_FILE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json"]);
const IMAGE_EXTENSION_PRIORITY = new Map([
  [".png", 4],
  [".jpg", 3],
  [".jpeg", 2],
  [".webp", 1],
]);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function collectFiles(rootDir, predicate, results = []) {
  if (!existsSync(rootDir)) {
    return results;
  }

  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const absolutePath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      collectFiles(absolutePath, predicate, results);
      continue;
    }

    if (predicate(absolutePath, entry.name)) {
      results.push(absolutePath);
    }
  }

  return results;
}

function collectImageFiles(rootDir) {
  return collectFiles(
    rootDir,
    (_absolutePath, entryName) => /\.(png|jpg|jpeg|webp)$/i.test(entryName) && !SKIP_FILES.has(entryName),
  );
}

function collectCodeFiles(rootDir) {
  return collectFiles(rootDir, (absolutePath) => CODE_FILE_EXTENSIONS.has(path.extname(absolutePath)));
}

function resolvePublicAssetPath(filePath) {
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  return `/${toPosixPath(relativePath)}`;
}

function logProjectRelativePath(filePath) {
  return toPosixPath(path.relative(projectRoot, filePath));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildConversionJobs(rootDir) {
  const candidates = collectImageFiles(rootDir);
  const jobsByKey = new Map();

  for (const candidate of candidates) {
    const extension = path.extname(candidate).toLowerCase();
    const priority = IMAGE_EXTENSION_PRIORITY.get(extension);

    if (priority === undefined) {
      continue;
    }

    const baseKey = toPosixPath(path.join(path.dirname(candidate), path.basename(candidate, path.extname(candidate)))).toLowerCase();
    const destinationPath = extension === ".webp"
      ? candidate
      : path.join(path.dirname(candidate), `${path.basename(candidate, path.extname(candidate))}.webp`);
    const current = jobsByKey.get(baseKey);

    if (!current || priority > current.priority) {
      jobsByKey.set(baseKey, {
        sourcePath: candidate,
        destinationPath,
        priority,
        updateReferences: extension !== ".webp",
      });
    }
  }

  return {
    candidates,
    jobs: [...jobsByKey.values()].sort((left, right) => left.destinationPath.localeCompare(right.destinationPath)),
  };
}

async function writeOutputFile(destinationPath, buffer) {
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, buffer);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function renderWebpBuffer(sourcePath) {
  return sharp(sourcePath)
    .rotate()
    .toColorspace("srgb")
    .webp({
      quality: QUALITY,
      effort: EFFORT,
    })
    .toBuffer();
}

async function convertToWebp(job) {
  const { sourcePath, destinationPath } = job;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const metadata = await sharp(sourcePath).metadata();
      const outputBuffer = await renderWebpBuffer(sourcePath);

      await writeOutputFile(destinationPath, outputBuffer);

      if (!existsSync(destinationPath) || statSync(destinationPath).size <= 0) {
        throw new Error("Generated file is empty.");
      }

      const actionLabel = sourcePath === destinationPath ? "Normalized" : "Converted";
      const sourceFormat = metadata.format ?? "unknown";
      const sourceSpace = metadata.space ?? "unknown";

      console.log(
        `${actionLabel}: ${path.basename(sourcePath)} [${sourceFormat}/${sourceSpace}] -> ${path.basename(destinationPath)} [webp/srgb]`,
      );

      return { ...job, success: true, sourceFormat, sourceSpace };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown conversion error";
      const canRetry = attempt < MAX_RETRIES && /open|EACCES|EPERM|UNKNOWN/i.test(errorMessage);

      if (canRetry) {
        console.warn(`Retrying (${attempt}/${MAX_RETRIES - 1}): ${sourcePath}`);
        await delay(RETRY_DELAY_MS);
        continue;
      }

      console.error(`Conversion failed: ${sourcePath}\n${errorMessage}`);
      return { ...job, success: false };
    }
  }

  return { ...job, success: false };
}

function replaceInFile(filePath, conversions) {
  let content = readFileSync(filePath, "utf8");
  let changed = false;

  for (const { sourcePath, destinationPath, success, updateReferences } of conversions) {
    if (!success || !updateReferences) {
      continue;
    }

    const relativeSourcePath = resolvePublicAssetPath(sourcePath);
    const relativeDestinationPath = resolvePublicAssetPath(destinationPath);
    const regex = new RegExp(escapeRegExp(relativeSourcePath), "gi");

    if (regex.test(content)) {
      content = content.replace(regex, relativeDestinationPath);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(filePath, content, "utf8");
    console.log(`Updated references: ${logProjectRelativePath(filePath)}`);
  }
}

const { candidates, jobs } = buildConversionJobs(IMAGES_DIR);
console.log(`Found ${candidates.length} image files and ${jobs.length} conversion jobs. Starting conversion.`);

const conversions = [];
for (const job of jobs) {
  conversions.push(await convertToWebp(job));
}

const succeeded = conversions.filter((conversion) => conversion.success);
const failed = conversions.filter((conversion) => !conversion.success);

console.log(`Conversion finished: ${succeeded.length} succeeded, ${failed.length} failed.`);

if (failed.length > 0) {
  console.error("The following files failed to convert and will be skipped when updating references:");
  for (const conversion of failed) {
    console.error(` - ${conversion.sourcePath}`);
  }
}

console.log("Updating code and content references.");
const codeFiles = [
  ...collectCodeFiles(SRC_DIR),
  ...collectCodeFiles(CONTENT_DIR),
];

for (const filePath of codeFiles) {
  replaceInFile(filePath, conversions);
}

console.log("All done.");
