import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  mergeFontLabPresetConfig,
  readFontLabConfig,
  writeFontLabConfig,
} from "./font-lab-config.ts";
import {
  createDefaultFontLabDocument,
  parseFontLabDocument,
  parseFontLabSavePayload,
} from "./font-lab-config-schema.ts";

test("parseFontLabDocument rejects invalid payload", () => {
  const invalid = parseFontLabDocument({
    version: 2,
    activePreset: "bogus",
    activeSize: "body",
    presets: {},
  });

  assert.equal(invalid, null);
});

test("parseFontLabDocument migrates v4 horizontal offsets into v5 edge offsets", () => {
  const parsed = parseFontLabDocument({
    version: 4,
    activePreset: "sans-body",
    activeSize: "body",
    presets: {
      "sans-body": {
        labelZh: "Futura + 姹変华鏃楅粦",
        latinFontScale: 1,
        latinWeightOffsetSteps: 0,
        sizes: {
          body: {
            cjkHorizontalOffset: -0.08,
            cjkLetterSpacing: 0.03,
            cjkVerticalOffset: 0,
            fontSize: "1rem",
            latinHorizontalOffset: -0.02,
            latinLetterSpacing: 0.03,
            latinRelativeOffset: 0.03,
            lineHeight: 1.6,
            semanticWeight: "regular",
          },
        },
      },
      "luna-editorial": createDefaultFontLabDocument().presets["luna-editorial"],
      "gothic-editorial": createDefaultFontLabDocument().presets["gothic-editorial"],
      "classical-display": createDefaultFontLabDocument().presets["classical-display"],
    },
  });

  assert.notEqual(parsed, null);
  assert.equal(parsed?.version, 5);
  assert.equal(parsed?.presets["sans-body"].sizes.body?.cjkEdgeOffset, -0.08);
  assert.equal(parsed?.presets["sans-body"].sizes.body?.latinEdgeOffset, -0.02);
});

test("readFontLabConfig falls back to defaults when file is missing", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "font-lab-config-"));
  const missingFile = path.join(tempDir, "missing.json");

  const config = await readFontLabConfig(missingFile);
  assert.deepEqual(config, createDefaultFontLabDocument());

  await fs.rm(tempDir, { force: true, recursive: true });
});

test("readFontLabConfig migrates legacy single-config files into the new document shape", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "font-lab-config-"));
  const configFile = path.join(tempDir, "legacy.json");

  await fs.writeFile(
    configFile,
    `${JSON.stringify({
      cjkBaselineOffset: 0.01,
      cjkLetterSpacing: 0.002,
      fontSize: "1.125rem",
      latinBaselineOffset: -0.012,
      latinLetterSpacing: 0.001,
      lineHeight: 1.82,
      preset: "gothic-editorial",
      size: "body-lg",
      tracking: 0.02,
    }, null, 2)}\n`,
    "utf8",
  );

  const config = await readFontLabConfig(configFile);

  assert.equal(config.version, 5);
  assert.equal(config.activePreset, "gothic-editorial");
  assert.equal(config.activeSize, "body-lg");
  assert.equal(config.presets["gothic-editorial"].sizes["body-lg"]?.fontSize, "1.125rem");
  assert.equal(config.presets["gothic-editorial"].sizes["body-lg"]?.lineHeight, 1.82);
  assert.equal(config.presets["gothic-editorial"].sizes["body-lg"]?.cjkEdgeOffset, 0);
  assert.equal(config.presets["gothic-editorial"].sizes["body-lg"]?.latinEdgeOffset, 0);
  assert.equal(config.presets["gothic-editorial"].sizes["body-lg"]?.semanticWeight, "medium");
  assert.equal(config.presets["gothic-editorial"].latinFontScale, 1);

  await fs.rm(tempDir, { force: true, recursive: true });
});

test("mergeFontLabPresetConfig only updates the targeted preset and keeps other presets unchanged", () => {
  const source = createDefaultFontLabDocument();
  const untouchedDisplay = source.presets["classical-display"].sizes.menu;
  const untouchedDisplaySize = source.presets["sans-body"].sizes.display;
  const merged = mergeFontLabPresetConfig(source, {
    activePreset: "sans-body",
    activeSize: "body",
    labelZh: source.presets["sans-body"].labelZh,
    latinFontScale: 1.06,
    latinWeightOffsetSteps: 1,
    sizeConfig: {
      ...source.presets["sans-body"].sizes.body!,
      fontSize: "1.125rem",
    },
  });

  assert.equal(merged.presets["sans-body"].sizes.body?.fontSize, "1.125rem");
  assert.equal(merged.presets["sans-body"].latinFontScale, 1.06);
  assert.equal(merged.presets["sans-body"].latinWeightOffsetSteps, 1);
  assert.deepEqual(merged.presets["sans-body"].sizes.display, untouchedDisplaySize);
  assert.deepEqual(merged.presets["classical-display"].sizes.menu, untouchedDisplay);
});

test("writeFontLabConfig persists and readFontLabConfig restores the same document", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "font-lab-config-"));
  const configFile = path.join(tempDir, "font-presets.json");
  const expected = mergeFontLabPresetConfig(createDefaultFontLabDocument(), {
    activePreset: "gothic-editorial",
    activeSize: "body-lg",
    labelZh: createDefaultFontLabDocument().presets["gothic-editorial"].labelZh,
    latinFontScale: 0.94,
    latinWeightOffsetSteps: -1,
    sizeConfig: {
      ...createDefaultFontLabDocument().presets["gothic-editorial"].sizes["body-lg"]!,
      fontSize: "1.125rem",
      lineHeight: 1.72,
    },
  });

  await writeFontLabConfig(expected, configFile);
  const actual = await readFontLabConfig(configFile);

  assert.deepEqual(actual, expected);

  await fs.rm(tempDir, { force: true, recursive: true });
});

test("writeFontLabConfig preserves the existing file line endings", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "font-lab-config-"));
  const configFile = path.join(tempDir, "font-presets.json");
  const expected = createDefaultFontLabDocument();

  await fs.writeFile(configFile, "{\r\n  \"version\": 5\r\n}\r\n", "utf8");
  await writeFontLabConfig(expected, configFile);

  const raw = await fs.readFile(configFile, "utf8");
  assert.match(raw, /\r\n/);
  assert.doesNotMatch(raw, /[^\r]\n/);

  await fs.rm(tempDir, { force: true, recursive: true });
});

test("parseFontLabSavePayload clamps unsupported template-level latin weight offsets", () => {
  const source = createDefaultFontLabDocument();
  const parsed = parseFontLabSavePayload({
    activePreset: "luna-editorial",
    activeSize: "body",
    labelZh: "Luna + 中文衬线体",
    latinFontScale: 99,
    latinWeightOffsetSteps: 99,
    sizeConfig: {
      ...source.presets["luna-editorial"].sizes.body,
      lineHeight: 1.78,
    },
  });

  assert.notEqual(parsed, null);
  assert.equal(parsed?.sizeConfig.lineHeight, 1.78);
  assert.equal(parsed?.latinFontScale, 99);
  assert.equal(parsed?.latinWeightOffsetSteps, 1);
  assert.equal(parsed?.sizeConfig.semanticWeight, "regular");
});

test("parseFontLabSavePayload can collapse legacy semantic weight mappings into one preset bias", () => {
  const parsed = parseFontLabSavePayload({
    activePreset: "gothic-editorial",
    activeSize: "body",
    labelZh: "Gothic + 中文衬线体",
    sizeConfig: createDefaultFontLabDocument().presets["gothic-editorial"].sizes.body,
    weights: {
      light: { cjk: 300, latin: 400 },
      regular: { cjk: 400, latin: 800 },
      medium: { cjk: 500, latin: 800 },
      strong: { cjk: 700, latin: 900 },
      display: { cjk: 900, latin: 900 },
    },
  });

  assert.notEqual(parsed, null);
  assert.equal(parsed?.latinWeightOffsetSteps, 1);
  assert.equal(parsed?.latinFontScale, 1);
});

test("parseFontLabSavePayload normalizes invalid latin font scale back to 1", () => {
  const parsed = parseFontLabSavePayload({
    activePreset: "sans-body",
    activeSize: "body",
    labelZh: "Futura + 汉仪旗黑",
    latinFontScale: 0,
    latinWeightOffsetSteps: 0,
    sizeConfig: createDefaultFontLabDocument().presets["sans-body"].sizes.body,
  });

  assert.notEqual(parsed, null);
  assert.equal(parsed?.latinFontScale, 1);
});
