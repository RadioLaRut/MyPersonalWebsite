export type DragBounds = {
  left: number;
  width: number;
};

export type DragPoint = {
  clientX: number;
  clientY: number;
};

export type GestureAxis = "horizontal" | "vertical" | "undecided";

export type DirectionIntentOptions = {
  axisBias?: number;
  threshold?: number;
};

export type SliderKeyboardKey =
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "End"
  | "Home"
  | "PageDown"
  | "PageUp";

const DEFAULT_DIRECTION_THRESHOLD = 8;
const DEFAULT_AXIS_BIAS = 1.15;

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export function calculateHorizontalPercent(clientX: number, bounds: DragBounds) {
  if (!Number.isFinite(bounds.width) || bounds.width <= 0) {
    return 0;
  }

  return clampPercent(((clientX - bounds.left) / bounds.width) * 100);
}

export function calculateSliderKeyboardPercent(
  currentPercent: number,
  key: string,
  step = 1,
  pageStep = 10,
): number | null {
  switch (key as SliderKeyboardKey) {
    case "Home":
      return 0;
    case "End":
      return 100;
    case "ArrowLeft":
    case "ArrowDown":
      return clampPercent(currentPercent - step);
    case "ArrowRight":
    case "ArrowUp":
      return clampPercent(currentPercent + step);
    case "PageDown":
      return clampPercent(currentPercent - pageStep);
    case "PageUp":
      return clampPercent(currentPercent + pageStep);
    default:
      return null;
  }
}

export function classifyDirectionalIntent(
  startPoint: DragPoint,
  currentPoint: DragPoint,
  options: DirectionIntentOptions = {},
): GestureAxis {
  const threshold = options.threshold ?? DEFAULT_DIRECTION_THRESHOLD;
  const axisBias = options.axisBias ?? DEFAULT_AXIS_BIAS;
  const deltaX = Math.abs(currentPoint.clientX - startPoint.clientX);
  const deltaY = Math.abs(currentPoint.clientY - startPoint.clientY);

  if (deltaX < threshold && deltaY < threshold) {
    return "undecided";
  }

  if (deltaX >= threshold && deltaX >= deltaY * axisBias) {
    return "horizontal";
  }

  if (deltaY >= threshold && deltaY >= deltaX) {
    return "vertical";
  }

  return "undecided";
}
