import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const editorShellCss = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor-shell.module.css"),
  "utf8",
);

test("page selector tree can extend beyond the Puck layout header", () => {
  const headerRule = editorShellCss.match(
    /\.adminShell\s+:global\(\[class\*="_PuckLayout-header_"\]\)\s*\{([\s\S]*?)\}/,
  );

  assert.ok(headerRule, "Puck layout header override is missing");
  assert.match(headerRule[1], /\bposition:\s*relative\s*;/);
  assert.match(headerRule[1], /\bz-index:\s*50\s*;/);
  assert.match(headerRule[1], /\boverflow:\s*visible\s*!important\s*;/);
});
