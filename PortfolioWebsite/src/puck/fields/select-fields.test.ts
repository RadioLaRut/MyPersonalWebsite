import assert from "node:assert/strict";
import test from "node:test";

import { castSelectValue, coerceLegacyBooleanSelectValue } from "./select-fields.ts";
import {
  createTextAlignmentField,
  TEXT_ALIGNMENT_OPTIONS,
} from "./text-alignment-field.ts";

test("castSelectValue returns known select values", () => {
  const options = ["left", "center", "right"] as const;

  assert.equal(castSelectValue("right", options, "center"), "right");
});

test("castSelectValue falls back for invalid values", () => {
  const options = ["left", "center", "right"] as const;

  assert.equal(castSelectValue("bottom", options, "center"), "center");
  assert.equal(castSelectValue(null, options, "center"), "center");
});

test("castSelectValue supports boolean and numeric select values", () => {
  const booleanOptions = [false, true] as const;
  const numericOptions = [1, 2, 3] as const;

  assert.equal(castSelectValue(true, booleanOptions, false), true);
  assert.equal(castSelectValue(2, numericOptions, 1), 2);
  assert.equal(castSelectValue("true", booleanOptions, false), false);
});

test("coerceLegacyBooleanSelectValue maps only legacy boolean strings", () => {
  assert.equal(coerceLegacyBooleanSelectValue("true"), true);
  assert.equal(coerceLegacyBooleanSelectValue("false"), false);
  assert.equal(coerceLegacyBooleanSelectValue("yes"), "yes");
  assert.equal(coerceLegacyBooleanSelectValue(true), true);
});

test("文本对齐字段工厂统一提供四个中文选项", () => {
  assert.deepEqual(TEXT_ALIGNMENT_OPTIONS, [
    { label: "左对齐", value: "left" },
    { label: "居中对齐", value: "center" },
    { label: "右对齐", value: "right" },
    { label: "两端对齐（含末行）", value: "justify" },
  ]);
  assert.deepEqual(createTextAlignmentField("正文对齐"), {
    label: "正文对齐",
    options: [...TEXT_ALIGNMENT_OPTIONS],
    type: "select",
  });
});
