import type {
  ComponentDesignRhythmToken,
  ComponentGridPlacement,
} from "./component-design-v2.ts";
import type {
  ComponentLabPreviewFlowVerticalOperation,
  ComponentLabPreviewOverlayVerticalOperation,
} from "./component-lab-preview-messages.ts";

export type ComponentLabGridOperation =
  | "move"
  | "resize-left"
  | "resize-right";

export type ComponentLabFlowCandidate = {
  height: number;
  occurrenceId: string;
  order: number;
  roleId: string;
  top: number;
};

export type ComponentLabDragRect = {
  height: number;
  top: number;
};

export type ComponentLabFlowOrderItem = {
  occurrenceId: string;
  order: number;
  roleId: string;
};

export const COMPONENT_LAB_DRAG_THRESHOLD = 4;
const COMPONENT_LAB_OVERLAY_OFFSET_LIMIT = 320;

const RHYTHM_TOKENS = [
  0,
  8,
  16,
  24,
  32,
  48,
  64,
] as const satisfies readonly ComponentDesignRhythmToken[];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function constrainComponentLabPlacement({
  currentPlacement,
  hostPlacement,
  lockPlacement,
  lockResize,
  operation,
  requestedPlacement,
}: {
  currentPlacement: ComponentGridPlacement;
  hostPlacement?: ComponentGridPlacement;
  lockPlacement: boolean;
  lockResize: boolean;
  operation: ComponentLabGridOperation;
  requestedPlacement: ComponentGridPlacement;
}): ComponentGridPlacement {
  if (
    lockPlacement ||
    (lockResize && operation !== "move")
  ) {
    return currentPlacement;
  }
  if (!hostPlacement) return requestedPlacement;

  const hostEnd = hostPlacement.start + hostPlacement.span - 1;
  const start = clamp(
    requestedPlacement.start,
    hostPlacement.start,
    hostEnd,
  );
  const span = clamp(
    requestedPlacement.span,
    1,
    hostEnd - start + 1,
  );
  return { span, start };
}

function snapToRhythm(value: number): ComponentDesignRhythmToken {
  const normalized = clamp(value, RHYTHM_TOKENS[0], RHYTHM_TOKENS.at(-1) ?? 64);
  return RHYTHM_TOKENS.reduce((closest, candidate) =>
    Math.abs(candidate - normalized) < Math.abs(closest - normalized)
      ? candidate
      : closest
  );
}

export function getComponentLabDraggedPlacement({
  clientX,
  gridGap,
  gridWidth,
  operation,
  originClientX,
  originPlacement,
}: {
  clientX: number;
  gridGap: number;
  gridWidth: number;
  operation: ComponentLabGridOperation;
  originClientX: number;
  originPlacement: ComponentGridPlacement;
}): ComponentGridPlacement {
  const columnWidth = (gridWidth - gridGap * 11) / 12;
  const pitch = Math.max(1, columnWidth + gridGap);
  const delta = Math.round((clientX - originClientX) / pitch);
  const { start, span } = originPlacement;

  if (operation === "resize-left") {
    const end = start + span - 1;
    const nextStart = clamp(start + delta, 1, end);
    return { span: end - nextStart + 1, start: nextStart };
  }
  if (operation === "resize-right") {
    const nextEnd = clamp(start + span - 1 + delta, start, 12);
    return { span: nextEnd - start + 1, start };
  }
  return { span, start: clamp(start + delta, 1, 13 - span) };
}

export function getComponentLabKeyboardPlacement({
  key,
  operation,
  placement,
}: {
  key: "ArrowLeft" | "ArrowRight";
  operation: ComponentLabGridOperation;
  placement: ComponentGridPlacement;
}): ComponentGridPlacement {
  const direction = key === "ArrowRight" ? 1 : -1;
  const { start, span } = placement;

  if (operation === "resize-left") {
    const end = start + span - 1;
    const nextStart = clamp(start + direction, 1, end);
    return { span: end - nextStart + 1, start: nextStart };
  }
  if (operation === "resize-right") {
    return {
      span: clamp(span + direction, 1, 13 - start),
      start,
    };
  }
  return {
    span,
    start: clamp(start + direction, 1, 13 - span),
  };
}

export function hasComponentLabDragThresholdBeenCrossed({
  clientX,
  clientY,
  originClientX,
  originClientY,
  threshold = COMPONENT_LAB_DRAG_THRESHOLD,
}: {
  clientX: number;
  clientY: number;
  originClientX: number;
  originClientY: number;
  threshold?: number;
}) {
  return Math.hypot(
    clientX - originClientX,
    clientY - originClientY,
  ) >= threshold;
}

/**
 * Flow 元素的纵向拖动只输出稳定的网页语义：跨过其他角色时改变 order，
 * 未跨过时把纵向位移折算为受控的 gapBefore。
 */
export function getComponentLabFlowVerticalOperation({
  candidates,
  clientY,
  originClientY,
  originGapBefore,
  originOrder,
  originRect,
}: {
  candidates: readonly ComponentLabFlowCandidate[];
  clientY: number;
  originClientY: number;
  originGapBefore: ComponentDesignRhythmToken;
  originOrder: number;
  originRect: ComponentLabDragRect;
}): ComponentLabPreviewFlowVerticalOperation {
  const deltaY = clientY - originClientY;
  const movedCenter = originRect.top + originRect.height / 2 + deltaY;
  const orderedCandidates = [...candidates].sort((left, right) =>
    left.order - right.order || left.top - right.top
  );
  const insertionIndex = orderedCandidates.filter(
    (candidate) => movedCenter > candidate.top + candidate.height / 2,
  ).length;
  const target = orderedCandidates.length === 0
    ? undefined
    : insertionIndex >= orderedCandidates.length
      ? orderedCandidates.at(-1)
      : orderedCandidates[insertionIndex];
  const insert = !target
    ? undefined
    : movedCenter > target.top + target.height / 2
      ? "after" as const
      : "before" as const;
  const order = insertionIndex;
  const changedOrder = order !== originOrder;

  return {
    gapBefore: changedOrder
      ? originGapBefore
      : snapToRhythm(originGapBefore + deltaY),
    mode: "flow",
    order,
    ...(target
      ? {
        insert,
        targetOccurrenceId: target.occurrenceId,
        targetRoleId: target.roleId,
      }
      : {}),
  };
}

/**
 * Overlay 元素不保存任意 Y 坐标，而是保存最接近的上/中/下锚点及 8px 偏移。
 */
export function getComponentLabOverlayVerticalOperation({
  clientY,
  originClientY,
  originRect,
  rootHeight,
  rootTop,
}: {
  clientY: number;
  originClientY: number;
  originRect: ComponentLabDragRect;
  rootHeight: number;
  rootTop: number;
}): ComponentLabPreviewOverlayVerticalOperation {
  const targetTop = originRect.top + clientY - originClientY;
  const anchors = [
    { anchor: "top" as const, top: rootTop },
    {
      anchor: "center" as const,
      top: rootTop + (rootHeight - originRect.height) / 2,
    },
    {
      anchor: "bottom" as const,
      top: rootTop + rootHeight - originRect.height,
    },
  ];
  const nearest = anchors.reduce((closest, candidate) =>
    Math.abs(candidate.top - targetTop) < Math.abs(closest.top - targetTop)
      ? candidate
      : closest
  );
  return {
    anchor: nearest.anchor,
    anchored: true,
    mode: "overlay",
    offset: clamp(
      Math.round((targetTop - nearest.top) / 8) * 8,
      -COMPONENT_LAB_OVERLAY_OFFSET_LIMIT,
      COMPONENT_LAB_OVERLAY_OFFSET_LIMIT,
    ),
  };
}

/**
 * 重排一个角色时同步重编号同一 Flow 中的其他角色，避免产生重复 order。
 * repeated occurrence 共享 role 级版式，因此在这里按 role 去重。
 */
export function getComponentLabReorderedFlowOrders({
  insertionIndex,
  items,
  movingRoleIds,
}: {
  insertionIndex: number;
  items: readonly ComponentLabFlowOrderItem[];
  movingRoleIds: readonly string[];
}) {
  const seen = new Set<string>();
  const ordered = [...items]
    .sort((left, right) => left.order - right.order)
    .filter((item) => {
      if (seen.has(item.roleId)) return false;
      seen.add(item.roleId);
      return true;
    });
  const moving = new Set(movingRoleIds);
  const movedItems = ordered.filter((item) => moving.has(item.roleId));
  const stationaryItems = ordered.filter((item) => !moving.has(item.roleId));
  const targetIndex = clamp(insertionIndex, 0, stationaryItems.length);
  const reordered = [
    ...stationaryItems.slice(0, targetIndex),
    ...movedItems,
    ...stationaryItems.slice(targetIndex),
  ];
  return Object.fromEntries(
    reordered.map((item, order) => [item.roleId, order]),
  );
}
