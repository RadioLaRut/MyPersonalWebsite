import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultFontLabDocument } from "./font-lab-config-schema.ts";
import {
  createDefaultFontLabSampleLayoutState,
  getFontLabActiveSizeConfig,
  updateFontLabActiveSizeConfig,
  updateFontLabPresetLatinFontScale,
  updateFontLabPresetWeightOffset,
  updateFontLabSelection,
} from "./font-lab-state.ts";

test("createDefaultFontLabSampleLayoutState keeps debug state local", () => {
  const layout = createDefaultFontLabSampleLayoutState();

  assert.equal(layout.showBaseline, true);
  assert.equal(layout.showLeftEdge, true);
  assert.equal(layout.showOpticalAlignment, true);
});

test("updateFontLabSelection normalizes unsupported sizes for the selected preset", () => {
  const source = createDefaultFontLabDocument();
  const next = updateFontLabSelection(source, "classical-display", "body");

  assert.equal(next.activePreset, "classical-display");
  assert.equal(next.activeSize, "menu");
});

test("updateFontLabSelection falls back to the closest configured size for narrowed presets", () => {
  const source = createDefaultFontLabDocument();
  const next = updateFontLabSelection(source, "sans-body", "title");

  assert.equal(next.activePreset, "sans-body");
  assert.equal(next.activeSize, "display");
});

test("updateFontLabActiveSizeConfig only changes the targeted size configuration", () => {
  const source = createDefaultFontLabDocument();
  const untouchedDisplay = source.presets["sans-body"].sizes.display;
  const next = updateFontLabActiveSizeConfig(source, "sans-body", "body", {
    fontSize: "1.125rem",
    semanticWeight: "medium",
  });

  assert.equal(getFontLabActiveSizeConfig(next, "sans-body", "body").fontSize, "1.125rem");
  assert.equal(getFontLabActiveSizeConfig(next, "sans-body", "body").semanticWeight, "medium");
  assert.deepEqual(next.presets["sans-body"].sizes.display, untouchedDisplay);
});

test("updateFontLabPresetWeightOffset only changes the targeted preset bias", () => {
  const source = createDefaultFontLabDocument();
  const untouchedLabel = source.presets["gothic-editorial"].sizes.label;
  const next = updateFontLabPresetWeightOffset(
    source,
    "gothic-editorial",
    1,
  );

  assert.equal(next.presets["gothic-editorial"].latinWeightOffsetSteps, 1);
  assert.deepEqual(next.presets["gothic-editorial"].sizes.label, untouchedLabel);
});

test("updateFontLabPresetLatinFontScale only changes the targeted preset scale", () => {
  const source = createDefaultFontLabDocument();
  const untouchedPreset = source.presets["luna-editorial"];
  const next = updateFontLabPresetLatinFontScale(source, "gothic-editorial", 1.08);

  assert.equal(next.presets["gothic-editorial"].latinFontScale, 1.08);
  assert.equal(next.presets["luna-editorial"].latinFontScale, untouchedPreset.latinFontScale);
});
