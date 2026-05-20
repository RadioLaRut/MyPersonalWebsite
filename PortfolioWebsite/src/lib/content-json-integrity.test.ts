import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  collectImageLikeReferences,
  formatContentValidationIssues,
  hasExactCasePath,
  validateContentPageFilePath,
  validateContentPages,
  validatePuckContentData,
  walkJsonFiles,
} from "./puck-content-validation.ts";

const projectRoot = path.resolve(process.cwd());
const contentRoot = path.join(projectRoot, "content/pages");
const publicRoot = path.join(projectRoot, "public");
const editorEmptyStatePath = path.join(projectRoot, "content/component-design/editor-empty-state.json");
const lightingCollectionsRoot = path.join(contentRoot, "works/lighting-portfolio");

test("content pages satisfy the normalized Puck data contract", () => {
  const issues = validateContentPages({ contentRoot, publicRoot });
  assert.deepEqual(formatContentValidationIssues(issues), []);
});

test("editor empty-state fixture is valid neutral starter content", () => {
  const data = JSON.parse(fs.readFileSync(editorEmptyStatePath, "utf8")) as unknown;
  const issues = validatePuckContentData(data, editorEmptyStatePath);

  assert.deepEqual(formatContentValidationIssues(issues), []);
  assert.doesNotMatch(
    JSON.stringify(data),
    /HeroHeadline-123|RichParagraph-456|Puck Local Editor|Phase 3|disk persistence|tmp -> rename|Publish writes/i,
  );
});

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

test("content page paths use canonical slug-safe names", () => {
  const issues = walkJsonFiles(contentRoot).flatMap((jsonFile) =>
    validateContentPageFilePath(jsonFile, contentRoot),
  );
  assert.deepEqual(formatContentValidationIssues(issues), []);
});

test("content JSON references only existing public images with exact filesystem casing", () => {
  const jsonFiles = walkJsonFiles(contentRoot);
  const missingImages: string[] = [];
  const dirEntriesCache = new Map<string, Set<string>>();

  for (const jsonFile of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(jsonFile, "utf8")) as unknown;
    const imagePaths = collectImageLikeReferences(data);

    for (const imagePath of imagePaths) {
      const relativeImagePath = imagePath.value.replace(/^\//, "");
      if (hasExactCasePath(publicRoot, relativeImagePath, dirEntriesCache) !== "ok") {
        missingImages.push(`${jsonFile} -> ${imagePath.value}`);
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
