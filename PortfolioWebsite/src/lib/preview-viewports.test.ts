import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_PREVIEW_VIEWPORT,
  getLogicalViewportUnit,
  PREVIEW_REFERENCE_VIEWPORT_PX,
  PREVIEW_VIEWPORTS,
  resolvePreviewViewportByWidth,
} from "./preview-viewports.ts";

test("desktop preview viewport stays aligned with the shared reference width", () => {
  const desktopViewport = PREVIEW_VIEWPORTS.find(
    (viewport) => viewport.key === "desktop",
  );

  assert.deepEqual(DEFAULT_PREVIEW_VIEWPORT, desktopViewport);
  assert.equal(desktopViewport?.width, PREVIEW_REFERENCE_VIEWPORT_PX);
  assert.equal(desktopViewport?.height, 960);
});

test("logical viewport units follow the three shared preview sizes", () => {
  assert.equal(getLogicalViewportUnit(PREVIEW_VIEWPORTS[0]), "8.44px");
  assert.equal(getLogicalViewportUnit(PREVIEW_VIEWPORTS[1]), "11.8px");
  assert.equal(getLogicalViewportUnit(PREVIEW_VIEWPORTS[2]), "9.6px");

  assert.equal(resolvePreviewViewportByWidth(390).key, "mobile");
  assert.equal(resolvePreviewViewportByWidth(820).key, "tablet");
  assert.equal(resolvePreviewViewportByWidth(1440).key, "desktop");
  assert.equal(resolvePreviewViewportByWidth(Number.NaN).key, "desktop");
});
