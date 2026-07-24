import assert from "node:assert/strict";
import test from "node:test";

import { mapWithConcurrency } from "./bounded-concurrency.mjs";

test("bounded mapper preserves order and never exceeds its worker limit", async () => {
  let active = 0;
  let peak = 0;
  const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
    active += 1;
    peak = Math.max(peak, active);
    await Promise.resolve();
    active -= 1;
    return value * 2;
  });

  assert.deepEqual(results, [2, 4, 6, 8, 10]);
  assert.equal(peak, 2);
});
