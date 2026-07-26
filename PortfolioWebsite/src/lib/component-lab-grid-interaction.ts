import type { ComponentGridPlacement } from "./component-design-v2.ts";

export type ComponentLabGridOperation =
  | "move"
  | "resize-left"
  | "resize-right";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
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
