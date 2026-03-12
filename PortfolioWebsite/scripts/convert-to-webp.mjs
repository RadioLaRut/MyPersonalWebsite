import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const PUBLIC_DIR = path.join(projectRoot, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const SRC_DIR = path.join(projectRoot, "src");
const CONTENT_DIR = path.join(projectRoot, "content");
const CWEBP_BIN = process.env.CWEBP_BIN?.trim() || "cwebp";
const QUALITY = 85;
const SKIP_FILES = new Set(["placeholder-16-9-1772675072147-5143c516.jpg"]);
const CODE_FILE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json"]);

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

function collectImages(rootDir) {
  return collectFiles(
    rootDir,
    (_absolutePath, entryName) => /\.(png|jpg|jpeg)$/i.test(entryName) && !SKIP_FILES.has(entryName),
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

function assertCwebpAvailable() {
  const result = spawnSync(CWEBP_BIN, ["-version"], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.error) {
    const errorCode = result.error.code ?? "UNKNOWN";
    console.error(
      `Unable to run "${CWEBP_BIN}" (${errorCode}). Install cwebp and ensure it is on PATH, or set the CWEBP_BIN environment variable.`,
    );
    process.exit(1);
  }

  if (result.status !== 0) {
    const errorMessage = result.stderr?.trim() || result.stdout?.trim() || "Unknown cwebp error";
    console.error(`Failed to run "${CWEBP_BIN} -version": ${errorMessage}`);
    process.exit(result.status ?? 1);
  }
}

function convertToWebp(sourcePath) {
  const destinationPath = sourcePath.replace(/\.(png|jpg|jpeg)$/i, ".webp");

  if (existsSync(destinationPath)) {
    console.log(`Skipped existing file: ${path.basename(destinationPath)}`);
    return { sourcePath, destinationPath, success: true, skipped: true };
  }

  const result = spawnSync(
    CWEBP_BIN,
    ["-q", String(QUALITY), sourcePath, "-o", destinationPath],
    {
      encoding: "utf8",
      stdio: "pipe",
    },
  );

  if (result.error) {
    console.error(`Conversion failed: ${sourcePath}\n${result.error.message}`);
    return { sourcePath, destinationPath, success: false, skipped: false };
  }

  if (result.status !== 0) {
    const errorMessage = result.stderr?.trim() || result.stdout?.trim() || "Unknown cwebp error";
    console.error(`Conversion failed: ${sourcePath}\n${errorMessage}`);
    return { sourcePath, destinationPath, success: false, skipped: false };
  }

  if (!existsSync(destinationPath) || statSync(destinationPath).size <= 0) {
    console.error(`Conversion failed with invalid output: ${sourcePath}`);
    return { sourcePath, destinationPath, success: false, skipped: false };
  }

  console.log(`Converted: ${path.basename(sourcePath)} -> ${path.basename(destinationPath)}`);
  return { sourcePath, destinationPath, success: true, skipped: false };
}

function replaceInFile(filePath, conversions) {
  let content = readFileSync(filePath, "utf8");
  let changed = false;

  for (const { sourcePath, destinationPath, success } of conversions) {
    if (!success) {
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

assertCwebpAvailable();

const images = collectImages(IMAGES_DIR);
console.log(`Found ${images.length} images. Starting conversion.`);

const conversions = images.map(convertToWebp);
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
