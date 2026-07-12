import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";

import {
  createDefaultFontLabDocument,
  parseFontLabSavePayload,
} from "./font-lab-config-schema.ts";

function basePayload(fontSize: string) {
  return {
    activePreset: "sans-body",
    activeSize: "body",
    labelZh: "Sans Body",
    latinFontScale: 1,
    latinWeightOffsetSteps: 0,
    sizeConfig: {
      fontSize,
    },
  };
}

function defaultBodyFontSize() {
  return createDefaultFontLabDocument().presets["sans-body"].sizes.body?.fontSize;
}

test("parseFontLabSavePayload falls back quickly for pathological rem fontSize", () => {
  const started = performance.now();
  const parsed = parseFontLabSavePayload(basePayload(`${"1".repeat(40000)}xrem`));
  const elapsedMs = performance.now() - started;

  assert.equal(parsed?.sizeConfig.fontSize, defaultBodyFontSize());
  assert.ok(elapsedMs < 100, `expected bounded parser time, got ${elapsedMs}ms`);
});

test("parseFontLabSavePayload falls back quickly for pathological clamp fontSize", () => {
  const started = performance.now();
  const parsed = parseFontLabSavePayload(basePayload(`clamp(${"1".repeat(40000)}xrem,1vw,2rem)`));
  const elapsedMs = performance.now() - started;

  assert.equal(parsed?.sizeConfig.fontSize, defaultBodyFontSize());
  assert.ok(elapsedMs < 100, `expected bounded parser time, got ${elapsedMs}ms`);
});

test("parseFontLabSavePayload still accepts legitimate rem and clamp fontSize values", () => {
  assert.equal(parseFontLabSavePayload(basePayload("1.25rem"))?.sizeConfig.fontSize, "1.25rem");
  assert.equal(parseFontLabSavePayload(basePayload("clamp(1rem,2vw,3rem)"))?.sizeConfig.fontSize, "1.8rem");
});
