import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(process.cwd());
const contentRoot = path.join(projectRoot, "content/pages");
const publicRoot = path.join(projectRoot, "public");
const lightingCollectionsRoot = path.join(contentRoot, "works/lighting-portfolio");
const imageLikePropPattern = /(src|imageSrc|heroImage|coverImage|nextBg|mediaSrc|litSrc|unlitSrc|leftImage|rightImage|lit|unlit)$/i;
const CANONICAL_SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WINDOWS_RESERVED_FILE_NAME_PATTERN = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;

function walkJsonFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

function collectImageLikePaths(value: unknown, acc: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectImageLikePaths(entry, acc);
    }
    return acc;
  }

  if (!value || typeof value !== "object") {
    return acc;
  }

  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string" && imageLikePropPattern.test(key) && entry.startsWith("/images/")) {
      acc.push(entry);
      continue;
    }

    collectImageLikePaths(entry, acc);
  }

  return acc;
}

function collectComponentTypes(value: unknown, acc: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectComponentTypes(entry, acc);
    }
    return acc;
  }

  if (!value || typeof value !== "object") {
    return acc;
  }

  if ("type" in value && typeof value.type === "string") {
    acc.push(value.type);
  }

  for (const entry of Object.values(value)) {
    collectComponentTypes(entry, acc);
  }

  return acc;
}

function hasExactCasePath(rootDir: string, relativePath: string) {
  let currentPath = rootDir;

  for (const segment of relativePath.split("/").filter(Boolean)) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    const exactEntry = entries.find((entry) => entry.name === segment);
    if (!exactEntry) {
      return false;
    }

    currentPath = path.join(currentPath, exactEntry.name);
  }

  return true;
}

function validateCanonicalSlugSegment(segment: string) {
  const normalized = segment.trim().toLowerCase();

  if (!normalized) {
    return "must not be empty";
  }

  if (normalized === "." || normalized === "..") {
    return 'must not be "." or ".."';
  }

  if (!CANONICAL_SLUG_SEGMENT_PATTERN.test(normalized)) {
    return "must use lowercase letters, numbers, and hyphens only";
  }

  if (WINDOWS_RESERVED_FILE_NAME_PATTERN.test(normalized)) {
    return "must not use a Windows reserved file name";
  }

  if (normalized !== segment) {
    return "must already use canonical lowercase slug casing";
  }

  return null;
}

function collectCanonicalContentPathIssues(dir: string, relativeDir = "", acc: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const directoryIssue = validateCanonicalSlugSegment(entry.name);
      if (directoryIssue) {
        acc.push(`${relativePath}: directory ${directoryIssue}`);
      }

      collectCanonicalContentPathIssues(absolutePath, relativePath, acc);
      continue;
    }

    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".json")) {
      continue;
    }

    if (path.extname(entry.name) !== ".json") {
      acc.push(`${relativePath}: file extension must be lowercase .json`);
    }

    const baseName = entry.name.slice(0, -path.extname(entry.name).length);
    const fileIssue = validateCanonicalSlugSegment(baseName);
    if (fileIssue) {
      acc.push(`${relativePath}: file name ${fileIssue}`);
    }
  }

  return acc;
}

test("content page paths use canonical slug-safe names", () => {
  const issues = collectCanonicalContentPathIssues(contentRoot);
  assert.deepEqual(issues, []);
});

test("content JSON references only existing public images with exact filesystem casing", () => {
  const jsonFiles = walkJsonFiles(contentRoot);
  const missingImages: string[] = [];

  for (const jsonFile of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(jsonFile, "utf8")) as unknown;
    const imagePaths = collectImageLikePaths(data);

    for (const imagePath of imagePaths) {
      const relativeImagePath = imagePath.replace(/^\//, "");
      const absoluteImagePath = path.join(publicRoot, ...relativeImagePath.split("/"));
      if (!fs.existsSync(absoluteImagePath) || !hasExactCasePath(publicRoot, relativeImagePath)) {
        missingImages.push(`${jsonFile} -> ${imagePath}`);
      }
    }
  }

  assert.deepEqual(missingImages, []);
});

test("lighting portfolio collections contain renderable visual content", () => {
  const collectionFiles = walkJsonFiles(lightingCollectionsRoot);
  const invalidCollections: string[] = [];

  for (const jsonFile of collectionFiles) {
    const data = JSON.parse(fs.readFileSync(jsonFile, "utf8")) as unknown;
    const componentTypes = collectComponentTypes(data);
    const visualItemCount = componentTypes.filter((type) =>
      ["LightingCollectionItem", "ImagePanel", "ImageSlider"].includes(type),
    ).length;

    if (visualItemCount === 0) {
      invalidCollections.push(jsonFile);
    }
  }

  assert.deepEqual(invalidCollections, []);
});
