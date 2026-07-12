import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  formatContentValidationIssues,
  validateContentPageFilePath,
  validateContentPages,
  validatePuckContentData,
} from "./puck-content-validation.ts";

function makeFixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "puck-content-validation-"));
  const contentRoot = path.join(root, "content/pages");
  const publicRoot = path.join(root, "public");
  fs.mkdirSync(contentRoot, { recursive: true });
  fs.mkdirSync(publicRoot, { recursive: true });
  return { contentRoot, publicRoot };
}

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function galleryImagePath(fileName: string) {
  return `/images/gallery/${fileName}`;
}

function issueText(issues: ReturnType<typeof validatePuckContentData>) {
  return formatContentValidationIssues(issues).join("\n");
}

test("validatePuckContentData rejects unknown component types", () => {
  const issues = validatePuckContentData({
    content: [
      {
        type: "UnknownBlock",
        props: { id: "unknown-block" },
      },
    ],
  });

  assert.match(issueText(issues), /UnknownBlock/);
  assert.match(issueText(issues), /unknown component type/i);
});

test("validatePuckContentData accepts legacy component types after normalization", () => {
  const issues = validatePuckContentData({
    content: [
      {
        type: "LightingCollectionItem",
        props: {
          id: "legacy-lighting-item",
          lit: galleryImagePath("Shot.webp"),
        },
      },
    ],
  });

  assert.deepEqual(issues, []);
});

test("validatePuckContentData rejects invalid top-level content shape", () => {
  const issues = validatePuckContentData({
    content: {},
  });

  assert.match(issueText(issues), /content/);
  assert.match(issueText(issues), /array/i);
});

test("validatePuckContentData accepts legacy component nodes after stable id normalization", () => {
  const issues = validatePuckContentData({
    content: [
      {
        type: "ImagePanel",
        props: {},
      },
    ],
  });

  assert.deepEqual(issues, []);
});

test("validatePuckContentData rejects native image presets paired with cover or y fit", () => {
  const issues = validatePuckContentData({
    content: [
      {
        type: "ImageSlider",
        props: {
          id: "invalid-native-fit",
          imagePreset: "native",
          imageFitMode: "y",
        },
      },
    ],
  });

  assert.match(issueText(issues), /native image preset cannot use y fit mode/i);
});

test("validateContentPageFilePath rejects non-canonical slug file names", () => {
  const { contentRoot } = makeFixtureRoot();
  const issues = validateContentPageFilePath(path.join(contentRoot, "Works/Bad.JSON"), contentRoot);

  assert.match(issueText(issues), /Works/);
  assert.match(issueText(issues), /Bad\.JSON/);
});

test("validateContentPages rejects missing public image references", () => {
  const { contentRoot, publicRoot } = makeFixtureRoot();
  writeJson(path.join(contentRoot, "index.json"), {
    content: [
      {
        type: "ImagePanel",
        props: {
          id: "missing-image",
          src: galleryImagePath("missing.webp"),
        },
      },
    ],
  });

  const issues = validateContentPages({ contentRoot, publicRoot });
  assert.match(issueText(issues), /missing\.webp/);
  assert.match(issueText(issues), /does not exist/i);
});

test("validateContentPages rejects placeholder images in public content", () => {
  const { contentRoot, publicRoot } = makeFixtureRoot();
  fs.mkdirSync(path.join(publicRoot, "assets/images"), { recursive: true });
  fs.writeFileSync(path.join(publicRoot, "assets/images/placeholder.svg"), "");
  writeJson(path.join(contentRoot, "index.json"), {
    content: [
      {
        type: "ImagePanel",
        props: {
          id: "placeholder-image",
          src: "/assets/images/placeholder.svg",
        },
      },
    ],
  });

  const issues = validateContentPages({ contentRoot, publicRoot });
  assert.match(issueText(issues), /cannot use placeholder image/i);
});

test("validateContentPages rejects public image references with casing mismatches", () => {
  const { contentRoot, publicRoot } = makeFixtureRoot();
  fs.mkdirSync(path.join(publicRoot, "images/gallery"), { recursive: true });
  fs.writeFileSync(path.join(publicRoot, "images/gallery/CaseImage.webp"), "");

  writeJson(path.join(contentRoot, "index.json"), {
    content: [
      {
        type: "ImagePanel",
        props: {
          id: "case-image",
          src: galleryImagePath("caseimage.webp"),
        },
      },
    ],
  });

  const issues = validateContentPages({ contentRoot, publicRoot });
  assert.match(issueText(issues), /caseimage\.webp/);
  assert.match(issueText(issues), /exact filesystem casing/i);
});
