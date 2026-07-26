import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  getComponentDesignRevision,
  readComponentDesignConfig,
  writeComponentDesignConfig,
} from "./component-design-config.ts";
import { createDefaultComponentDesignDocument } from "./component-design-v2.ts";

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
  document.components.RichParagraph.variants.default.nodes.body.typography!.size =
    "body-lg";
  document.components.HeroSection.variants.full.nodes.title.placement.desktop = {
    span: 8,
    start: 3,
  };
  document.components.HeroSection.variants.full.gaps["eyebrow>title"].desktop = 24;
  document.components.ProjectCoverLink.variants["immersive-left"].nodes.title
    .opticalPull = 8;

  await writeComponentDesignConfig(document, filePath);
  const readBack = await readComponentDesignConfig(filePath);

  assert.equal(
    readBack.components.RichParagraph.variants.default.nodes.body.typography!.size,
    "body-lg",
  );
  assert.deepEqual(
    readBack.components.HeroSection.variants.full.nodes.title.placement.desktop,
    { span: 8, start: 3 },
  );
  assert.equal(
    readBack.components.HeroSection.variants.full.gaps["eyebrow>title"].desktop,
    24,
  );
  assert.equal(
    readBack.components.ProjectCoverLink.variants["immersive-left"].nodes.title
      .opticalPull,
    8,
  );
  assert.deepEqual(await fs.readdir(tempRoot), ["component-design.json"]);
  await fs.rm(tempRoot, { force: true, recursive: true });
});

test("component design revision is stable and changes with design values", () => {
  const first = createDefaultComponentDesignDocument();
  const equivalent = structuredClone(first);
  const changed = structuredClone(first);
  changed.components.HeroSection.variants.full.nodes.title.placement.desktop = {
    span: 9,
    start: 2,
  };

  assert.equal(
    getComponentDesignRevision(first),
    getComponentDesignRevision(equivalent),
  );
  assert.notEqual(
    getComponentDesignRevision(first),
    getComponentDesignRevision(changed),
  );
});
