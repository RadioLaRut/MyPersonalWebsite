import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { PAGE_DOCUMENT_VERSION } from "../src/lib/page-document-contract.ts";

const scriptPath = fileURLToPath(new URL("./migrate-page-documents.mjs", import.meta.url));

function createCurrentDocument(description = "Current description") {
  return {
    content: [],
    root: {
      props: {
        description,
        image: "",
        noIndex: true,
        title: "Current",
      },
    },
    version: PAGE_DOCUMENT_VERSION,
    zones: {},
  };
}

function createWorkspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "page-migration-cli-"));
  fs.mkdirSync(path.join(root, "content/pages"), { recursive: true });
  fs.mkdirSync(path.join(root, "public"), { recursive: true });
  return root;
}

function writeJson(filePath: string, value: unknown) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  fs.writeFileSync(filePath, serialized, "utf8");
  return serialized;
}

function runMigration(root: string) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: "utf8",
  });
}

test("migration CLI leaves current documents byte-identical and migrates legacy once", () => {
  const root = createWorkspace();
  const currentPath = path.join(root, "content/pages/index.json");
  const legacyPath = path.join(root, "content/pages/new-page.json");
  const currentRaw = writeJson(currentPath, createCurrentDocument("Do not replace"));
  writeJson(legacyPath, {
    content: [],
    root: { props: { title: "New legacy page" } },
    zones: {},
  });

  const firstRun = runMigration(root);
  assert.equal(firstRun.status, 0, firstRun.stderr);
  assert.equal(fs.readFileSync(currentPath, "utf8"), currentRaw);
  assert.equal(JSON.parse(fs.readFileSync(legacyPath, "utf8")).version, PAGE_DOCUMENT_VERSION);

  const migratedRaw = fs.readFileSync(legacyPath, "utf8");
  const secondRun = runMigration(root);
  assert.equal(secondRun.status, 0, secondRun.stderr);
  assert.equal(fs.readFileSync(currentPath, "utf8"), currentRaw);
  assert.equal(fs.readFileSync(legacyPath, "utf8"), migratedRaw);
});

test("migration CLI validates the full batch before writing any legacy document", () => {
  const root = createWorkspace();
  const legacyPath = path.join(root, "content/pages/a-legacy.json");
  const legacyRaw = writeJson(legacyPath, {
    content: [],
    root: { props: { title: "Legacy" } },
    zones: {},
  });
  writeJson(path.join(root, "content/pages/z-invalid.json"), {
    ...createCurrentDocument(),
    version: PAGE_DOCUMENT_VERSION + 1,
  });

  const result = runMigration(root);
  assert.notEqual(result.status, 0);
  assert.equal(fs.readFileSync(legacyPath, "utf8"), legacyRaw);
});
