import assert from "node:assert/strict";
import test from "node:test";

import { castSelectValue } from "./select-fields.ts";

test("castSelectValue returns known select values", () => {
  const options = ["left", "center", "right"] as const;

  assert.equal(castSelectValue("right", options, "center"), "right");
});

test("castSelectValue falls back for invalid values", () => {
  const options = ["left", "center", "right"] as const;

  assert.equal(castSelectValue("bottom", options, "center"), "center");
  assert.equal(castSelectValue(null, options, "center"), "center");
});
