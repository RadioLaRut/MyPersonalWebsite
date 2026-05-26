import type {
  ComponentDesignParameterItemSpan,
  ComponentGridBounds,
} from "@/lib/component-design-schema";

function getBoundsSpan(bounds: ComponentGridBounds) {
  return bounds.rightCol - bounds.leftCol + 1;
}

export function getParameterGridItemBounds(
  parametersBounds: ComponentGridBounds,
  requestedSpan: ComponentDesignParameterItemSpan,
  index: number,
): ComponentGridBounds {
  const availableSpan = getBoundsSpan(parametersBounds);
  const effectiveSpan = Math.max(1, Math.min(requestedSpan, availableSpan));
  const itemsPerRow = Math.max(1, Math.floor(availableSpan / effectiveSpan));
  const columnOffset = (index % itemsPerRow) * effectiveSpan;
  const leftCol = parametersBounds.leftCol + columnOffset;

  return {
    leftCol,
    rightCol: Math.min(leftCol + effectiveSpan - 1, parametersBounds.rightCol),
  };
}
