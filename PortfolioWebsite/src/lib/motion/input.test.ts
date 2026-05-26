import assert from "node:assert/strict";
import test from "node:test";

import { resolveInputCapabilities } from "./input.ts";

function createMatchMedia(matches: Record<string, boolean>) {
  return (query: string) => ({
    matches: matches[query] ?? false,
  });
}

test("resolveInputCapabilities recognizes a fine pointer hover environment", () => {
  const capabilities = resolveInputCapabilities({
    innerWidth: 1440,
    matchMedia: createMatchMedia({
      "(hover: hover)": true,
      "(pointer: fine)": true,
      "(pointer: coarse)": false,
      "(prefers-reduced-motion: reduce)": false,
    }),
    maxTouchPoints: 0,
  });

  assert.equal(capabilities.canHover, true);
  assert.equal(capabilities.hasFinePointer, true);
  assert.equal(capabilities.hasCoarsePointer, false);
  assert.equal(capabilities.isTouchLike, false);
  assert.equal(capabilities.prefersReducedMotion, false);
  assert.equal(capabilities.supportsHoverIntent, true);
});

test("resolveInputCapabilities treats small coarse screens as touch-like", () => {
  const capabilities = resolveInputCapabilities({
    hasTouchStart: true,
    innerWidth: 390,
    matchMedia: createMatchMedia({
      "(hover: hover)": false,
      "(pointer: fine)": false,
      "(pointer: coarse)": true,
      "(prefers-reduced-motion: reduce)": false,
    }),
    maxTouchPoints: 5,
  });

  assert.equal(capabilities.canHover, false);
  assert.equal(capabilities.hasCoarsePointer, true);
  assert.equal(capabilities.isTouchLike, true);
  assert.equal(capabilities.supportsHoverIntent, false);
});

test("resolveInputCapabilities keeps hybrid large screens hover-capable", () => {
  const capabilities = resolveInputCapabilities({
    hasTouchStart: true,
    innerWidth: 1280,
    matchMedia: createMatchMedia({
      "(hover: hover)": true,
      "(pointer: fine)": true,
      "(pointer: coarse)": true,
      "(prefers-reduced-motion: reduce)": false,
    }),
    maxTouchPoints: 10,
  });

  assert.equal(capabilities.isTouchLike, false);
  assert.equal(capabilities.supportsHoverIntent, true);
});
