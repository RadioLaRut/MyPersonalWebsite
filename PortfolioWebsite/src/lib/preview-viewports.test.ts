import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_PREVIEW_VIEWPORT,
  PREVIEW_REFERENCE_VIEWPORT_PX,
  PREVIEW_VIEWPORTS,
} from "./preview-viewports.ts";

test("desktop preview viewport stays aligned with the shared reference width", () => {
  const desktopViewport = PREVIEW_VIEWPORTS.find(
    (viewport) => viewport.key === "desktop",
  );

  assert.deepEqual(DEFAULT_PREVIEW_VIEWPORT, desktopViewport);
  assert.equal(desktopViewport?.width, PREVIEW_REFERENCE_VIEWPORT_PX);
  assert.equal(desktopViewport?.height, 960);
});
