import assert from "node:assert/strict";
import test from "node:test";

import {
  castTypographyAlignment,
  getTypographyAlignmentStyle,
  isTypographyAlignment,
  TYPOGRAPHY_ALIGNMENT_VALUES,
} from "./typography-alignment.ts";

test("Typography 四种对齐值映射到稳定的 CSS", () => {
  assert.deepEqual(TYPOGRAPHY_ALIGNMENT_VALUES, [
    "left",
    "center",
    "right",
    "justify",
  ]);
  assert.deepEqual(getTypographyAlignmentStyle("left"), {
    textAlign: "left",
    textAlignLast: undefined,
  });
  assert.deepEqual(getTypographyAlignmentStyle("center"), {
    textAlign: "center",
    textAlignLast: undefined,
  });
  assert.deepEqual(getTypographyAlignmentStyle("right"), {
    textAlign: "right",
    textAlignLast: undefined,
  });
  assert.deepEqual(getTypographyAlignmentStyle("justify"), {
    textAlign: "justify",
    textAlignLast: "justify",
  });
});

test("Typography 拒绝未知对齐枚举", () => {
  assert.equal(isTypographyAlignment("justify"), true);
  assert.equal(isTypographyAlignment("start"), false);
  assert.equal(isTypographyAlignment(""), false);
  assert.equal(isTypographyAlignment(null), false);
  assert.equal(castTypographyAlignment("center"), "center");
  assert.equal(castTypographyAlignment("start"), "left");
  assert.equal(castTypographyAlignment(null, "right"), "right");
});
