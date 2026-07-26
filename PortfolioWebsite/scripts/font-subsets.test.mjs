import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  buildPublicCharacterSet,
  compactUnicodeRanges,
  createFontSubsetInputState,
  verifyGeneratedFontArtifacts,
} from "./font-subset-lib.mjs";

const projectRoot = process.cwd();

test("公开字符集固定、规范化并自动包含页面中文", () => {
  const first = buildPublicCharacterSet(projectRoot);
  const second = buildPublicCharacterSet(projectRoot);

  assert.equal(first.charsetHash, second.charsetHash);
  assert.equal(first.characters, second.characters);
  assert.ok(first.characters.includes("企"));
  assert.ok(first.characters.includes("é"));
  assert.equal(first.characters.includes("😀"), false);
});

test("Unicode range 合并连续码点", () => {
  assert.equal(
    compactUnicodeRanges([0x41, 0x42, 0x43, 0x45]),
    "U+41-43, U+45",
  );
});

test("许可证清单阻止未授权字体进入子集源", () => {
  const state = createFontSubsetInputState(projectRoot);
  assert.equal(
    state.inventory.families["source-han-serif-sc"].delivery,
    "subset",
  );
  assert.equal(state.inventory.families["hanyi-qihei"].delivery, "on-demand-full");
});

test("已提交字体产物与当前输入哈希一致", () => {
  const state = createFontSubsetInputState(projectRoot);
  const verification = verifyGeneratedFontArtifacts(projectRoot, state);
  assert.equal(verification.fresh, true, verification.reason);

  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(projectRoot, "src/generated/public-font-subsets.json"),
      "utf8",
    ),
  );
  assert.equal(manifest.tool.version, "4.63.0");
  assert.equal(manifest.generatorVersion, 2);
  assert.ok(manifest.faces.every((face) => face.url.endsWith(".woff2")));
  assert.ok(manifest.faces.every((face) => {
    const supported = new Set(face.supportedCodepoints);
    return face.sourceSupportedCodepoints.every((codepoint) =>
      supported.has(codepoint));
  }));
  assert.equal(
    manifest.typographyCoverage["classical-display"].latin.status,
    "verified",
  );
  assert.equal(
    manifest.typographyCoverage["sans-body"].cjk.status,
    "license-blocked",
  );
});
