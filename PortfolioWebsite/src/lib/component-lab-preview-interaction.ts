import type {
  ComponentDesignNodeKind,
} from "./component-design-manifest.ts";
import type {
  ComponentLabPreviewSelectionTarget,
} from "./component-lab-preview-messages.ts";

export type ComponentLabHitCandidate = ComponentLabPreviewSelectionTarget & {
  area: number;
  bleed: "none" | "viewport";
  depth: number;
  kind: ComponentDesignNodeKind;
  visualOrder: number;
};

function distanceFromRect(
  x: number,
  y: number,
  rect: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  },
) {
  const horizontal = x < rect.left
    ? rect.left - x
    : x > rect.right
      ? x - rect.right
      : 0;
  const vertical = y < rect.top
    ? rect.top - y
    : y > rect.bottom
      ? y - rect.bottom
      : 0;
  return Math.hypot(horizontal, vertical);
}

export function resolveComponentLabPointerCoordinates({
  clientX,
  clientY,
  layoutHeight,
  layoutWidth,
  referenceRect,
  renderedHeight,
  renderedWidth,
}: {
  clientX: number;
  clientY: number;
  layoutHeight: number;
  layoutWidth: number;
  referenceRect?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  renderedHeight: number;
  renderedWidth: number;
}) {
  const inverseScaleX = layoutWidth > 0 && renderedWidth > 0
    ? layoutWidth / renderedWidth
    : 1;
  const inverseScaleY = layoutHeight > 0 && renderedHeight > 0
    ? layoutHeight / renderedHeight
    : 1;
  const normalized = {
    clientX: clientX * inverseScaleX,
    clientY: clientY * inverseScaleY,
    scaleX: inverseScaleX,
    scaleY: inverseScaleY,
  };
  if (!referenceRect) {
    return { clientX, clientY, scaleX: 1, scaleY: 1 };
  }
  const rawDistance = distanceFromRect(clientX, clientY, referenceRect);
  const normalizedDistance = distanceFromRect(
    normalized.clientX,
    normalized.clientY,
    referenceRect,
  );
  return normalizedDistance + 0.5 < rawDistance
    ? normalized
    : { clientX, clientY, scaleX: 1, scaleY: 1 };
}

function kindPriority(
  kind: ComponentDesignNodeKind,
  bleed: "none" | "viewport",
) {
  if (kind === "text" || kind === "action") return 4;
  if (kind === "container" || kind === "repeater") return 3;
  if (bleed === "viewport") return 1;
  return 2;
}

/**
 * 编辑命中优先级与页面视觉层级分开处理。文字/动作永远先于容器和媒体，
 * 满屏媒体只在没有前景目标时才会被选中。
 */
export function compareComponentLabHitCandidates(
  left: ComponentLabHitCandidate,
  right: ComponentLabHitCandidate,
) {
  const priorityDifference =
    kindPriority(right.kind, right.bleed) -
    kindPriority(left.kind, left.bleed);
  if (priorityDifference !== 0) return priorityDifference;
  if (left.visualOrder !== right.visualOrder) {
    return left.visualOrder - right.visualOrder;
  }
  if (left.depth !== right.depth) return right.depth - left.depth;
  return left.area - right.area;
}

export function pickComponentLabHitCandidate(
  candidates: readonly ComponentLabHitCandidate[],
) {
  return [...candidates].sort(compareComponentLabHitCandidates)[0] ?? null;
}

export function getComponentLabOccurrenceId(
  _roleId: string,
  occurrenceIndex: number,
) {
  return String(occurrenceIndex);
}

export function areComponentLabSelectionTargetsEqual(
  left: ComponentLabPreviewSelectionTarget,
  right: ComponentLabPreviewSelectionTarget,
) {
  return left.roleId === right.roleId &&
    left.occurrenceId === right.occurrenceId;
}

export function updateComponentLabSelection({
  additive,
  current,
  target,
}: {
  additive: boolean;
  current: readonly ComponentLabPreviewSelectionTarget[];
  target: ComponentLabPreviewSelectionTarget;
}): ComponentLabPreviewSelectionTarget[] {
  const exists = current.some((candidate) =>
    areComponentLabSelectionTargetsEqual(candidate, target)
  );
  if (!additive) {
    return exists ? [...current] : [target];
  }
  return exists
    ? current.filter((candidate) =>
      !areComponentLabSelectionTargetsEqual(candidate, target)
    )
    : [...current, target];
}
