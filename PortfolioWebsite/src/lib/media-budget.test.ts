import assert from "node:assert/strict";
import test from "node:test";

import {
  MEDIA_BUDGET_V1,
  MediaBudgetError,
  readAndValidateMediaMetadata,
  SHARP_MEDIA_INPUT_OPTIONS,
  validateMediaMetadata,
} from "./media-budget.ts";

test("media budget accepts exact static-image boundaries", () => {
  assert.deepEqual(validateMediaMetadata({
    height: 4_882,
    pages: 1,
    width: 8_192,
  }), {
    frames: 1,
    height: 4_882,
    pixels: 39_993_344,
    width: 8_192,
  });
  assert.equal(SHARP_MEDIA_INPUT_OPTIONS.limitInputPixels, MEDIA_BUDGET_V1.maxPixels);
  assert.equal(SHARP_MEDIA_INPUT_OPTIONS.failOn, "error");
});

test("media budget rejects dimension, pixel, and animation overflow", () => {
  for (const metadata of [
    { height: 1, width: 8_193 },
    { height: 8_192, width: 8_192 },
    { height: 100, pages: 2, width: 100 },
    { frames: 2, height: 100, width: 100 },
    { height: 0, width: 100 },
  ]) {
    assert.throws(() => validateMediaMetadata(metadata), MediaBudgetError);
  }
});

test("media metadata reader converts decoder failures into media validation errors", async () => {
  await assert.rejects(
    () => readAndValidateMediaMetadata(async () => {
      throw new Error("decoder failed");
    }),
    MediaBudgetError,
  );

  assert.deepEqual(
    await readAndValidateMediaMetadata(async () => ({
      height: 100,
      pages: 1,
      width: 200,
    })),
    {
      frames: 1,
      height: 100,
      pixels: 20_000,
      width: 200,
    },
  );
});
