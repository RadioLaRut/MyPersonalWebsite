import assert from "node:assert/strict";
import test from "node:test";

import {
  areResponsiveTypographyRenderVariantsEqual,
  getTypographyEdgeScripts,
  isTypographyAutospace,
  isTypographyNumericStyle,
  isTypographyPreset,
  isTypographySize,
  isTypographyWeight,
  isTypographyWrapPolicy,
  resolveResponsiveTypographyRenderVariants,
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

test("font lab preset sizes cover public runtime styles while staying narrower than full runtime support", () => {
  assert.equal(isTypographySizeSupported("sans-body", "title"), true);
  assert.equal(isTypographyFontLabSizeSupported("sans-body", "title"), true);
  assert.equal(isTypographyFontLabSizeSupported("luna-editorial", "hero"), true);
  assert.equal(isTypographyFontLabSizeSupported("gothic-editorial", "body-lg"), true);
  assert.equal(isTypographyFontLabSizeSupported("sans-body", "display"), true);
  assert.equal(isTypographyFontLabSizeSupported("classical-display", "display"), false);
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

test("getTypographyEdgeScripts resolves leading and trailing scripts from mixed text", () => {
  const mixed = getTypographyEdgeScripts("UE5 光照叙事\n电影化镜头");
  const cjkOnly = getTypographyEdgeScripts("电影化镜头叙事");

  assert.equal(mixed.leading, "latin");
  assert.equal(mixed.trailing, "cjk");
  assert.equal(cjkOnly.leading, "cjk");
  assert.equal(cjkOnly.trailing, "cjk");
});

test("响应式 Typography 为三个断点生成同内容渲染实例，普通输入维持单实例", () => {
  assert.equal(resolveResponsiveTypographyRenderVariants({
    preset: "sans-body",
    size: "body",
    wrapPolicy: "prose",
  }), null);

  assert.deepEqual(resolveResponsiveTypographyRenderVariants({
    preset: {
      desktop: "luna-editorial",
      mobile: "sans-body",
      tablet: "gothic-editorial",
    },
    size: {
      desktop: "display",
      mobile: "title-sm",
      tablet: "label",
    },
    wrapPolicy: {
      desktop: "heading",
      mobile: "prose",
      tablet: "nowrap",
    },
  }), [
    {
      breakpoint: "mobile",
      preset: "sans-body",
      size: "title-sm",
      wrapPolicy: "prose",
    },
    {
      breakpoint: "tablet",
      preset: "gothic-editorial",
      size: "label",
      wrapPolicy: "nowrap",
    },
    {
      breakpoint: "desktop",
      preset: "luna-editorial",
      size: "display",
      wrapPolicy: "heading",
    },
  ]);
});

test("三个断点字体完全相同时可以复用单个 Typography 实例", () => {
  const variants = resolveResponsiveTypographyRenderVariants({
    preset: {
      desktop: "sans-body",
      mobile: "sans-body",
      tablet: "sans-body",
    },
    size: {
      desktop: "body",
      mobile: "body",
      tablet: "body",
    },
    wrapPolicy: {
      desktop: "prose",
      mobile: "prose",
      tablet: "prose",
    },
  });

  assert.ok(variants);
  assert.equal(
    areResponsiveTypographyRenderVariantsEqual(variants),
    true,
  );
});

test("neutral script resolution keeps left priority and resets at line breaks", () => {
  const leftPriority = segmentTypographyText("中🙂English").filter(
    (run): run is Extract<TypographyTextRun, { type: "text" }> => run.type === "text",
  );
  const rightFallback = segmentTypographyText("🙂中文").filter(
    (run): run is Extract<TypographyTextRun, { type: "text" }> => run.type === "text",
  );
  const lineReset = segmentTypographyText("中文\n🙂English").filter(
    (run): run is Extract<TypographyTextRun, { type: "text" }> => run.type === "text",
  );

  assert.equal(leftPriority[0]?.script, "cjk");
  assert.equal(leftPriority[0]?.value, "中🙂");
  assert.equal(rightFallback[0]?.script, "cjk");
  assert.equal(lineReset[1]?.script, "latin");
});

test("all-neutral text and Unicode code points preserve the original content", () => {
  const source = "🙂 — …";
  const runs = segmentTypographyText(source);

  assert.equal(rebuildText(runs), source);
  assert.deepEqual(runs, [{ script: "latin", type: "text", value: source }]);
});

test("long neutral runs preserve the previous segmentation semantics", () => {
  const neutralText = "🙂".repeat(4_096);
  const source = `中${neutralText}A`;
  const runs = segmentTypographyText(source).filter(
    (run): run is Extract<TypographyTextRun, { type: "text" }> => run.type === "text",
  );

  assert.equal(runs.length, 2);
  assert.equal(runs[0]?.script, "cjk");
  assert.equal(runs[0]?.value, `中${neutralText}`);
  assert.equal(runs[1]?.script, "latin");
  assert.equal(rebuildText(runs), source);
});
