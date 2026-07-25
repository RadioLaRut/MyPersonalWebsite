export const CANVAS_HORIZONTAL_INSET = 48;
export const CANVAS_VERTICAL_INSET = 60;
export const PREVIEW_CONTENT_HEIGHT_EVENT = "puck-preview-content-height";

const MINIMUM_PREVIEW_SCALE = 0.2;

function finitePositive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function getPreviewCanvasScale(
  containerWidth: number,
  viewportWidth: number,
) {
  const usableWidth = Math.max(
    0,
    finitePositive(containerWidth) - CANVAS_HORIZONTAL_INSET,
  );
  const safeViewportWidth = finitePositive(viewportWidth);

  if (safeViewportWidth === 0) {
    return 1;
  }

  return Math.min(
    1,
    Math.max(MINIMUM_PREVIEW_SCALE, usableWidth / safeViewportWidth),
  );
}

export function getPreviewCanvasHeight({
  containerHeight,
  contentHeight,
  scale,
}: {
  containerHeight: number;
  contentHeight: number;
  scale: number;
}) {
  const usableHeight = Math.max(
    0,
    finitePositive(containerHeight) - CANVAS_VERTICAL_INSET,
  );
  const safeScale = finitePositive(scale);
  const fillHeight = safeScale > 0 ? usableHeight / safeScale : 0;

  return Math.ceil(Math.max(1, finitePositive(contentHeight), fillHeight));
}

export function parsePreviewContentHeight(detail: unknown) {
  if (
    !detail ||
    typeof detail !== "object" ||
    !("height" in detail) ||
    typeof detail.height !== "number"
  ) {
    return null;
  }

  const height = finitePositive(detail.height);
  return height > 0 ? Math.ceil(height) : null;
}
