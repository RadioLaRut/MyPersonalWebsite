import assert from "node:assert/strict";
import test from "node:test";

import {
  isTypographyAutospace,
  isTypographyNumericStyle,
  isTypographyPreset,
  isTypographySize,
  isTypographyWeight,
  isTypographyWrapPolicy,
  segmentTypographyText,
  type TypographyTextRun,
} from "./typography.ts";
import {
  resolveTypographyPresetWeightPair,
  getTypographyFontLabSizes,
  getTypographyWrapToken,
  isTypographyFontLabSizeSupported,
  isTypographySizeSupported,
} from "./typography-tokens.ts";

function rebuildText(input: ReturnType<typeof segmentTypographyText>) {
  return input.map((run) => run.value).join("");
}

test("segmentTypographyText preserves raw text without injecting extra spaces", () => {
  const source = "中文English混排 2026";
  const runs = segmentTypographyText(source);

  assert.equal(rebuildText(runs), source);
  assert.ok(runs.some((run) => run.type === "text" && run.script === "cjk"));
  assert.ok(runs.some((run) => run.type === "text" && run.script === "latin"));
});

test("segmentTypographyText keeps whitespace and manual line breaks", () => {
  const source = "Line A  01\n第二行 English";
  const runs = segmentTypographyText(source);

  assert.equal(rebuildText(runs), source);
  assert.equal(runs.filter((run) => run.type === "break").length, 1);
});

test("segmentTypographyText keeps full-width punctuation with cjk runs", () => {
  const source = "中文，English。";
  const runs = segmentTypographyText(source).filter(
    (run): run is Extract<TypographyTextRun, { type: "text" }> => run.type === "text",
  );

  assert.equal(runs[0]?.script, "cjk");
  assert.equal(runs[0]?.value, "中文，");
});

test("typography validators only accept declared token values", () => {
  assert.equal(isTypographyPreset("sans-body"), true);
  assert.equal(isTypographyPreset("bogus"), false);
  assert.equal(isTypographySize("body"), true);
  assert.equal(isTypographySize("menu"), true);
  assert.equal(isTypographySize("mega"), false);
  assert.equal(isTypographyWeight("display"), true);
  assert.equal(isTypographyWeight("900"), false);
  assert.equal(isTypographyWrapPolicy("url"), true);
  assert.equal(isTypographyWrapPolicy("nowrap"), true);
  assert.equal(isTypographyWrapPolicy("break-all"), false);
  assert.equal(isTypographyAutospace("normal"), true);
  assert.equal(isTypographyAutospace("inherit"), false);
  assert.equal(isTypographyNumericStyle("tabular"), true);
  assert.equal(isTypographyNumericStyle("lining"), false);
});

test("classical-display remains restricted to display sizes", () => {
  assert.equal(isTypographySizeSupported("classical-display", "menu"), true);
  assert.equal(isTypographySizeSupported("classical-display", "display"), true);
  assert.equal(isTypographySizeSupported("classical-display", "hero"), true);
  assert.equal(isTypographySizeSupported("classical-display", "body"), false);
});

test("font lab preset sizes can be narrower than runtime supported sizes", () => {
  assert.equal(isTypographySizeSupported("sans-body", "title"), true);
  assert.equal(isTypographyFontLabSizeSupported("sans-body", "title"), false);
  assert.equal(isTypographyFontLabSizeSupported("sans-body", "display"), true);
  assert.deepEqual(getTypographyFontLabSizes("classical-display"), ["menu"]);
});

test("template-level latin weight offsets shift semantic weights by available steps", () => {
  const regular = resolveTypographyPresetWeightPair("gothic-editorial", "regular", 1);
  const display = resolveTypographyPresetWeightPair("gothic-editorial", "display", 1);
  const clamped = resolveTypographyPresetWeightPair("classical-display", "regular", 99);

  assert.equal(regular.cjk, 400);
  assert.equal(regular.latin, 800);
  assert.equal(display.latin, 900);
  assert.equal(clamped.latin, 400);
});

test("nowrap wrap policy stays on a single line", () => {
  const wrapToken = getTypographyWrapToken("nowrap");

  assert.equal(wrapToken.whiteSpace, "nowrap");
  assert.equal(wrapToken.overflowWrap, "normal");
  assert.equal(wrapToken.wordBreak, "normal");
});
