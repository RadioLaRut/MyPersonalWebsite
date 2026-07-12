import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
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
import { toSafePuckHref } from "./puck-href.ts";

const projectRoot = path.resolve(process.cwd());
const contentRoot = path.join(projectRoot, "content/pages");
const publicRoot = path.join(projectRoot, "public");
const editorEmptyStatePath = path.join(projectRoot, "content/component-design/editor-empty-state.json");
const lightingCollectionsRoot = path.join(contentRoot, "works/lighting-portfolio");
const penguinCaseStudyPath = path.join(contentRoot, "works/penguin.json");
const editorEmptyStateData = JSON.parse(fs.readFileSync(editorEmptyStatePath, "utf8")) as {
  content: Array<{ props: Record<string, unknown>; type: string }>;
  root: { props: Record<string, unknown> };
};
const penguinCaseStudyData = JSON.parse(fs.readFileSync(penguinCaseStudyPath, "utf8")) as {
  content: Array<{ props: Record<string, unknown>; type: string }>;
};

test("content pages satisfy the normalized Puck data contract", () => {
  const issues = validateContentPages({ contentRoot, publicRoot });
  assert.deepEqual(formatContentValidationIssues(issues), []);
});

test("penguin case study preserves playable CTAs and truthful contribution boundaries", () => {
  const shareHref = "https://pan.baidu.com/s/1FSpd75VGEuJpnZHLOnEWHw?pwd=aavq";
  const hero = penguinCaseStudyData.content.find((node) => node.type === "HeroHeadline");
  const endcap = penguinCaseStudyData.content.find((node) => node.type === "HomeEndcapSection");
  const serialized = JSON.stringify(penguinCaseStudyData);
  const ids = penguinCaseStudyData.content.map((node) => node.props.id);

  assert.equal(hero?.props.navLink, shareHref);
  assert.equal(hero?.props.navLinkLabel, "下载可玩版本");
  assert.equal(endcap?.props.buttonHref, shareHref);
  assert.equal(endcap?.props.buttonLabel, "下载可玩版本");
  assert.equal(toSafePuckHref(shareHref), shareHref);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(serialized, /具体技术架构均由 AI 生成/);
  assert.doesNotMatch(serialized, /8\s*人|半年|已完成并结项|大大提高|我实现了|我编写/);
});

test("editor empty-state fixture is valid neutral starter content", () => {
  const issues = validatePuckContentData(editorEmptyStateData, editorEmptyStatePath);

  assert.deepEqual(formatContentValidationIssues(issues), []);
  assert.doesNotMatch(
    JSON.stringify(editorEmptyStateData),
    /HeroHeadline-123|RichParagraph-456|Puck Local Editor|Phase 3|disk persistence|tmp -> rename|Publish writes|project study|short narrative block|process, visuals, and outcomes/i,
  );
});

test("editor empty-state fixture satisfies the full content page contract", (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "editor-empty-state-content-"));
  t.after(() => {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  });

  const tempContentRoot = path.join(tempRoot, "content/pages");
  fs.mkdirSync(tempContentRoot, { recursive: true });
  fs.copyFileSync(editorEmptyStatePath, path.join(tempContentRoot, "index.json"));

  const issues = validateContentPages({ contentRoot: tempContentRoot, publicRoot });

  assert.deepEqual(formatContentValidationIssues(issues), []);
});

test("editor empty-state fixture uses short neutral placeholders", () => {
  const hero = editorEmptyStateData.content.find((node) => node.type === "HeroHeadline");
  const paragraph = editorEmptyStateData.content.find((node) => node.type === "RichParagraph");

  assert.equal(editorEmptyStateData.root.props.title, "Untitled");
  assert.equal(hero?.props.title, "Untitled");
  assert.equal(hero?.props.subtitle, "");
  assert.equal(paragraph?.props.content, "");
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
