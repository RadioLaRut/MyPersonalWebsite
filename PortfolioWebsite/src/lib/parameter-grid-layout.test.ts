import assert from "node:assert/strict";
import test from "node:test";

import { getParameterGridItemBounds } from "./parameter-grid-layout.ts";

test("getParameterGridItemBounds keeps item spans aligned to the site-wide 12-column grid", () => {
  assert.deepEqual(
    getParameterGridItemBounds({ leftCol: 2, rightCol: 11 }, 3, 0),
    { leftCol: 2, rightCol: 4 },
  );
  assert.deepEqual(
    getParameterGridItemBounds({ leftCol: 2, rightCol: 11 }, 3, 1),
    { leftCol: 5, rightCol: 7 },
  );
  assert.deepEqual(
    getParameterGridItemBounds({ leftCol: 2, rightCol: 11 }, 3, 2),
    { leftCol: 8, rightCol: 10 },
  );
  assert.deepEqual(
    getParameterGridItemBounds({ leftCol: 2, rightCol: 11 }, 3, 3),
    { leftCol: 2, rightCol: 4 },
  );
});

test("getParameterGridItemBounds clamps oversized item spans to the configured bounds", () => {
  assert.deepEqual(
    getParameterGridItemBounds({ leftCol: 4, rightCol: 7 }, 6, 0),
    { leftCol: 4, rightCol: 7 },
  );
  assert.deepEqual(
    getParameterGridItemBounds({ leftCol: 4, rightCol: 7 }, 6, 1),
    { leftCol: 4, rightCol: 7 },
  );
});
