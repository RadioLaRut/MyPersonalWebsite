import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  readComponentDesignConfig,
  writeComponentDesignConfig,
} from "./component-design-config.ts";
import { createDefaultComponentDesignDocument } from "./component-design-schema.ts";

test("readComponentDesignConfig falls back to defaults when file is missing", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "component-design-read-"));
  const filePath = path.join(tempRoot, "component-design.json");

  const document = await readComponentDesignConfig(filePath);

  assert.deepEqual(document, createDefaultComponentDesignDocument());
  await fs.rm(tempRoot, { force: true, recursive: true });
});

test("writeComponentDesignConfig persists normalized JSON", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "component-design-write-"));
  const filePath = path.join(tempRoot, "component-design.json");
  const document = createDefaultComponentDesignDocument();
  document.components.RichParagraph.bodySize = "body";
  document.components.ContentCard.textOnlyBounds.leftCol = 2;
  document.components.HeroSection.contentBounds.lg.leftCol = 3;
  document.components.HeroSection.eyebrowTopSpacing = "20";
  document.components.ProjectSection.lockupGap = "16";
  document.components.ProjectSection.titleUnderlineOpticalPull = "24";

  await writeComponentDesignConfig(document, filePath);
  const readBack = await readComponentDesignConfig(filePath);

  assert.equal(readBack.components.RichParagraph.bodySize, "body");
  assert.equal(readBack.components.ContentCard.textOnlyBounds.leftCol, 2);
  assert.equal(readBack.components.HeroSection.contentBounds.lg.leftCol, 3);
  assert.equal(readBack.components.HeroSection.eyebrowTopSpacing, "20");
  assert.equal(readBack.components.ProjectSection.lockupGap, "16");
  assert.equal(readBack.components.ProjectSection.titleUnderlineOpticalPull, "24");
  await fs.rm(tempRoot, { force: true, recursive: true });
});
