import assert from "node:assert/strict";
import test from "node:test";

import { buildImageFieldTriple } from "./image-fields.ts";

test("buildImageFieldTriple derives media-prefixed preset and fit mode keys", () => {
  const triple = buildImageFieldTriple("mediaSrc", {
    defaultPreset: "ratio-21-9",
  });

  assert.deepEqual(triple.defaults, {
    mediaSrc: "",
    mediaPreset: "ratio-21-9",
    mediaFitMode: "x",
  });
  assert.ok("mediaSrc" in triple.fields);
  assert.ok("mediaPreset" in triple.fields);
  assert.ok("mediaFitMode" in triple.fields);
});

test("buildImageFieldTriple allows render-compatible preset and fit mode keys", () => {
  const triple = buildImageFieldTriple("mediaSrc", {
    defaultFitMode: "cover",
    defaultPreset: "ratio-21-9",
    fitModeKey: "imageFitMode",
    presetKey: "imagePreset",
  });

  assert.deepEqual(triple.defaults, {
    mediaSrc: "",
    imagePreset: "ratio-21-9",
    imageFitMode: "cover",
  });
  assert.ok("imagePreset" in triple.fields);
  assert.ok("imageFitMode" in triple.fields);
  assert.equal("mediaPreset" in triple.fields, false);
  assert.equal("mediaFitMode" in triple.fields, false);
});
