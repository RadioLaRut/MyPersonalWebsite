import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  buildPublicCharacterSet,
  compactUnicodeRanges,
  createFontSubsetInputState,
  SUBSET_FONT_SOURCES,
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

test("许可证清单只允许有明确证据的字体进入子集源", () => {
  const state = createFontSubsetInputState(projectRoot);
  const familyIds = new Set(
    SUBSET_FONT_SOURCES.map((source) => source.licenseFamily),
  );

  for (const familyId of familyIds) {
    assert.equal(state.inventory.families[familyId].delivery, "subset");
    assert.equal(state.inventory.families[familyId].status, "verified");
    assert.ok(state.inventory.families[familyId].evidence.length > 0);
  }
  assert.equal(
    state.inventory.families["hanyi-qihei"].license,
    "PROJECT-OWNER-WEB-SUBSET",
  );
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
  assert.equal(manifest.generatorVersion, 3);
  assert.equal(manifest.faces.length, SUBSET_FONT_SOURCES.length);
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
    "verified",
  );
  assert.equal(manifest.blockedFamilies.length, 0);
  assert.deepEqual(
    [...new Set(manifest.faces.map((face) => face.familyId))].sort(),
    [
      "dm-serif-display",
      "futura",
      "hanyi-qihei",
      "itc-serif-gothic",
      "luna-itc",
      "source-han-serif-sc",
    ],
  );
});
