import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(process.cwd());
const contentRoot = path.join(projectRoot, "content/pages");
const publicRoot = path.join(projectRoot, "public");
const lightingCollectionsRoot = path.join(contentRoot, "works/lighting-portfolio");

const imageLikePropPattern = /(src|imageSrc|heroImage|coverImage|nextBg|mediaSrc|litSrc|unlitSrc|leftImage|rightImage|lit|unlit)$/i;

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

test("content JSON references only existing public images", () => {
  const jsonFiles = walkJsonFiles(contentRoot);
  const missingImages: string[] = [];

  for (const jsonFile of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(jsonFile, "utf8")) as unknown;
    const imagePaths = collectImageLikePaths(data);

    for (const imagePath of imagePaths) {
      const absoluteImagePath = path.join(publicRoot, imagePath.replace(/^\//, ""));
      if (!fs.existsSync(absoluteImagePath)) {
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
