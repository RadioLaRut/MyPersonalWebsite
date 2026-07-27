import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  getComponentDesignRevision,
  readComponentDesignConfig,
  readComponentDesignSourceConfig,
  writeComponentDesignConfig,
  writeComponentDesignSourceConfig,
} from "./component-design-config.ts";
import {
  createDefaultComponentDesignDocument as createDefaultComponentDesignDocumentV2,
} from "./component-design-v2.ts";
import {
  createDefaultComponentDesignDocument,
  resolveComponentDesignRuntimeDocument,
} from "./component-design-v3.ts";

test("readComponentDesignConfig falls back to defaults when file is missing", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "component-design-read-"));
  const filePath = path.join(tempRoot, "component-design.json");

  const document = await readComponentDesignConfig(filePath);

  assert.deepEqual(
    document,
    resolveComponentDesignRuntimeDocument(
      createDefaultComponentDesignDocument(),
    ),
  );
  await fs.rm(tempRoot, { force: true, recursive: true });
});

test("writeComponentDesignConfig persists normalized JSON", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "component-design-write-"));
  const filePath = path.join(tempRoot, "component-design.json");
  const document = createDefaultComponentDesignDocumentV2();
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
  const source = await readComponentDesignSourceConfig(filePath);

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
  assert.equal(source.version, 3);
  assert.equal(
    source.components.HeroSection.variants.full.tablet.mode,
    "custom",
  );
  assert.deepEqual(await fs.readdir(tempRoot), ["component-design.json"]);
  await fs.rm(tempRoot, { force: true, recursive: true });
});

test("readComponentDesignSourceConfig migrates V2 in memory without rewriting", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "component-design-migrate-"));
  const filePath = path.join(tempRoot, "component-design.json");
  const legacy = createDefaultComponentDesignDocumentV2();
  legacy.components.HeroSection.variants.full.nodes.title.placement.tablet = {
    span: 10,
    start: 2,
  };
  await fs.writeFile(filePath, JSON.stringify(legacy), "utf8");

  const migrated = await readComponentDesignSourceConfig(filePath);
  const persisted = JSON.parse(await fs.readFile(filePath, "utf8"));

  assert.equal(migrated.version, 3);
  assert.equal(migrated.components.HeroSection.variants.full.tablet.mode, "custom");
  assert.deepEqual(
    migrated.components.HeroSection.variants.full.tablet.custom.nodes.title
      .placement,
    { span: 10, start: 2 },
  );
  assert.equal(persisted.version, 2);
  await fs.rm(tempRoot, { force: true, recursive: true });
});

test("writeComponentDesignSourceConfig rejects a normalized but incomplete V3 draft", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "component-design-strict-"));
  const filePath = path.join(tempRoot, "component-design.json");
  const invalid = structuredClone(
    createDefaultComponentDesignDocument(),
  ) as unknown as { version: number; components: Record<string, unknown> };
  delete invalid.components.HeroSection;

  await assert.rejects(
    writeComponentDesignSourceConfig(
      invalid as never,
      filePath,
    ),
    /Invalid current component design document/,
  );
  assert.equal(await fs.stat(tempRoot).then(() => true), true);
  await fs.rm(tempRoot, { force: true, recursive: true });
});

test("component design revision is stable and changes with design values", () => {
  const first = createDefaultComponentDesignDocumentV2();
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
