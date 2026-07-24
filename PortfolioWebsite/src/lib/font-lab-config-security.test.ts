import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";

import {
  createDefaultFontLabDocument,
  FONT_LAB_INPUT_LIMITS,
  parseBoundedFontLabNumberInput,
  parseFontLabSavePayload,
} from "./font-lab-config-schema.ts";

function basePayload(fontSize: string) {
  const defaultSize = createDefaultFontLabDocument().presets["sans-body"].sizes.body;
  return {
    activePreset: "sans-body",
    activeSize: "body",
    labelZh: "Sans Body",
    latinFontScale: 1,
    latinWeightOffsetSteps: 0,
    sizeConfig: {
      ...defaultSize,
      fontSize,
    },
  };
}

test("parseFontLabSavePayload quickly rejects pathological rem fontSize", () => {
  const started = performance.now();
  const parsed = parseFontLabSavePayload(basePayload(`${"1".repeat(40000)}xrem`));
  const elapsedMs = performance.now() - started;

  assert.equal(parsed, null);
  assert.ok(elapsedMs < 100, `expected bounded parser time, got ${elapsedMs}ms`);
});

test("parseFontLabSavePayload quickly rejects pathological clamp fontSize", () => {
  const started = performance.now();
  const parsed = parseFontLabSavePayload(basePayload(`clamp(${"1".repeat(40000)}xrem,1vw,2rem)`));
  const elapsedMs = performance.now() - started;

  assert.equal(parsed, null);
  assert.ok(elapsedMs < 100, `expected bounded parser time, got ${elapsedMs}ms`);
});

test("parseFontLabSavePayload accepts canonical rem and rejects non-canonical clamp values", () => {
  assert.equal(parseFontLabSavePayload(basePayload("1.25rem"))?.sizeConfig.fontSize, "1.25rem");
  assert.equal(parseFontLabSavePayload(basePayload("clamp(1rem,2vw,3rem)")), null);
});

test("Font Lab label limits count Unicode code points and UTF-8 bytes", () => {
  const payload = basePayload("1rem");

  for (const labelZh of ["A", "A".repeat(64), "🙂".repeat(64)]) {
    assert.ok(parseFontLabSavePayload({ ...payload, labelZh }));
  }
  for (const labelZh of ["", "   ", "A".repeat(65), "🙂".repeat(65)]) {
    assert.equal(parseFontLabSavePayload({ ...payload, labelZh }), null);
  }

  assert.equal(FONT_LAB_INPUT_LIMITS.labelCodePoints, 64);
  assert.equal(FONT_LAB_INPUT_LIMITS.labelUtf8Bytes, 256);
});

test("Font Lab numeric controls accept exact boundaries and reject just-outside values", () => {
  const payload = basePayload("1rem");
  const cases = [
    {
      field: "latinFontScale",
      max: FONT_LAB_INPUT_LIMITS.latinFontScale.max,
      min: FONT_LAB_INPUT_LIMITS.latinFontScale.min,
      nested: false,
    },
    {
      field: "lineHeight",
      max: FONT_LAB_INPUT_LIMITS.lineHeight.max,
      min: FONT_LAB_INPUT_LIMITS.lineHeight.min,
      nested: true,
    },
    ...["cjkEdgeOffset", "cjkVerticalOffset", "latinEdgeOffset", "latinRelativeOffset"].map(
      (field) => ({
        field,
        max: FONT_LAB_INPUT_LIMITS.offset.max,
        min: FONT_LAB_INPUT_LIMITS.offset.min,
        nested: true,
      }),
    ),
    ...["cjkLetterSpacing", "latinLetterSpacing"].map((field) => ({
      field,
      max: FONT_LAB_INPUT_LIMITS.letterSpacing.max,
      min: FONT_LAB_INPUT_LIMITS.letterSpacing.min,
      nested: true,
    })),
  ] as const;

  for (const testCase of cases) {
    const withValue = (value: number) => testCase.nested
      ? {
        ...payload,
        sizeConfig: { ...payload.sizeConfig, [testCase.field]: value },
      }
      : { ...payload, [testCase.field]: value };

    assert.ok(parseFontLabSavePayload(withValue(testCase.min)), testCase.field);
    assert.ok(parseFontLabSavePayload(withValue(testCase.max)), testCase.field);
    assert.equal(parseFontLabSavePayload(withValue(testCase.min - 0.0001)), null);
    assert.equal(parseFontLabSavePayload(withValue(testCase.max + 0.0001)), null);
    assert.equal(parseFontLabSavePayload(withValue(Number.NaN)), null);
    assert.equal(parseFontLabSavePayload(withValue(Number.POSITIVE_INFINITY)), null);
  }
});

test("Font Lab reference font size accepts 0.5–12rem only", () => {
  assert.ok(parseFontLabSavePayload(basePayload("0.5rem")));
  assert.ok(parseFontLabSavePayload(basePayload("12rem")));
  assert.equal(parseFontLabSavePayload(basePayload("0.4999rem")), null);
  assert.equal(parseFontLabSavePayload(basePayload("12.0001rem")), null);
});

test("Font Lab client number parsing rejects empty and out-of-range drafts", () => {
  const range = FONT_LAB_INPUT_LIMITS.lineHeight;

  assert.equal(parseBoundedFontLabNumberInput("0.8", range), 0.8);
  assert.equal(parseBoundedFontLabNumberInput(" 3 ", range), 3);
  assert.equal(parseBoundedFontLabNumberInput("", range), null);
  assert.equal(parseBoundedFontLabNumberInput("0", range), null);
  assert.equal(parseBoundedFontLabNumberInput("3.01", range), null);
  assert.equal(parseBoundedFontLabNumberInput("not-a-number", range), null);
});
