import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateHorizontalPercent,
  calculateSliderKeyboardPercent,
  classifyDirectionalIntent,
  clampPercent,
} from "./drag.ts";

test("clampPercent keeps slider positions inside 0 to 100", () => {
  assert.equal(clampPercent(-12), 0);
  assert.equal(clampPercent(42.5), 42.5);
  assert.equal(clampPercent(140), 100);
});

test("calculateHorizontalPercent maps a client x coordinate into a clamped percentage", () => {
  const bounds = { left: 100, width: 400 };

  assert.equal(calculateHorizontalPercent(100, bounds), 0);
  assert.equal(calculateHorizontalPercent(300, bounds), 50);
  assert.equal(calculateHorizontalPercent(500, bounds), 100);
  assert.equal(calculateHorizontalPercent(620, bounds), 100);
});

test("calculateSliderKeyboardPercent supports slider navigation keys and clamps results", () => {
  assert.equal(calculateSliderKeyboardPercent(50, "ArrowLeft"), 49);
  assert.equal(calculateSliderKeyboardPercent(50, "ArrowRight"), 51);
  assert.equal(calculateSliderKeyboardPercent(50, "ArrowDown"), 49);
  assert.equal(calculateSliderKeyboardPercent(50, "ArrowUp"), 51);
  assert.equal(calculateSliderKeyboardPercent(50, "PageDown"), 40);
  assert.equal(calculateSliderKeyboardPercent(50, "PageUp"), 60);
  assert.equal(calculateSliderKeyboardPercent(50, "Home"), 0);
  assert.equal(calculateSliderKeyboardPercent(50, "End"), 100);
  assert.equal(calculateSliderKeyboardPercent(0, "ArrowLeft"), 0);
  assert.equal(calculateSliderKeyboardPercent(100, "PageUp"), 100);
  assert.equal(calculateSliderKeyboardPercent(50, "Enter"), null);
});

test("classifyDirectionalIntent waits until movement crosses the threshold", () => {
  assert.equal(
    classifyDirectionalIntent({ clientX: 40, clientY: 40 }, { clientX: 45, clientY: 43 }),
    "undecided",
  );
});

test("classifyDirectionalIntent prefers horizontal drag when horizontal movement clearly wins", () => {
  assert.equal(
    classifyDirectionalIntent({ clientX: 20, clientY: 20 }, { clientX: 54, clientY: 28 }),
    "horizontal",
  );
});

test("classifyDirectionalIntent preserves page scroll when vertical movement wins", () => {
  assert.equal(
    classifyDirectionalIntent({ clientX: 20, clientY: 20 }, { clientX: 28, clientY: 54 }),
    "vertical",
  );
});
