import assert from "node:assert/strict";
import test from "node:test";

import { isElementCenterInsideViewportZone } from "./scroll.ts";

test("isElementCenterInsideViewportZone detects an element centered in the viewport zone", () => {
  assert.equal(
    isElementCenterInsideViewportZone({ height: 120, top: 440 }, 1000),
    true,
  );
});

test("isElementCenterInsideViewportZone rejects elements outside the center zone", () => {
  assert.equal(
    isElementCenterInsideViewportZone({ height: 120, top: 120 }, 1000),
    false,
  );
});

test("isElementCenterInsideViewportZone accepts custom zone ratios", () => {
  assert.equal(
    isElementCenterInsideViewportZone({ height: 80, top: 310 }, 800, 0.12),
    false,
  );
  assert.equal(
    isElementCenterInsideViewportZone({ height: 80, top: 360 }, 800, 0.12),
    true,
  );
});
