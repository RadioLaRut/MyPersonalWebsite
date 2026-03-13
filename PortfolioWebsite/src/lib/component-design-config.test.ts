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

  await writeComponentDesignConfig(document, filePath);
  const readBack = await readComponentDesignConfig(filePath);

  assert.equal(readBack.components.RichParagraph.bodySize, "body");
  assert.equal(readBack.components.ContentCard.textOnlyBounds.leftCol, 2);
  await fs.rm(tempRoot, { force: true, recursive: true });
});
