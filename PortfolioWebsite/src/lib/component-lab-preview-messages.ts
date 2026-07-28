import type { Data } from "@puckeditor/core";

import type {
  ComponentDesignBreakpoint,
  ComponentDesignDocument,
  ComponentDesignRhythmToken,
  ComponentGridPlacement,
} from "./component-design-v2.ts";
import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  COMPONENT_DESIGN_MANIFEST_BY_COMPONENT,
  type ComponentDesignAuthorComponent,
  type ComponentDesignCompositionDescriptor,
} from "./component-design-manifest.ts";
import { areJsonStructuresEqual } from "./json-utils.ts";

export const COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION = 4 as const;

export const COMPONENT_LAB_PREVIEW_RENDER_MESSAGE = "component-lab-preview-render-v4";
export const COMPONENT_LAB_PREVIEW_READY_MESSAGE = "component-lab-preview-ready-v4";
export const COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE = "component-lab-preview-height-v4";
export const COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE = "component-lab-preview-select-node-v4";
export const COMPONENT_LAB_PREVIEW_INTERACTION_MESSAGE =
  "component-lab-preview-interaction-v4";

/**
 * 旧调用方仍然通过 placement 常量监听横向格位变化。V4 将格位、纵向语义
 * 和文字修改统一为 interaction 消息，同时保留旧导出，便于分阶段接入。
 */
export const COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE =
  COMPONENT_LAB_PREVIEW_INTERACTION_MESSAGE;
export const COMPONENT_LAB_PREVIEW_TEXT_CHANGE_MESSAGE =
  COMPONENT_LAB_PREVIEW_INTERACTION_MESSAGE;

const COMPONENT_LAB_OVERLAY_OFFSET_LIMIT = 320;

export type ComponentLabPreviewSelectionTarget = {
  occurrenceId: string;
  roleId: string;
};

export type ComponentLabPreviewFlowPosition = {
  gapBefore: ComponentDesignRhythmToken;
  mode: "flow";
  order: number;
};

export type ComponentLabPreviewOverlayPosition = {
  anchor: "top" | "center" | "bottom";
  anchored?: true;
  mode: "overlay";
  offset: number;
};

export type ComponentLabPreviewPosition =
  | ComponentLabPreviewFlowPosition
  | ComponentLabPreviewOverlayPosition;

export type ComponentLabPreviewFlowVerticalOperation =
  ComponentLabPreviewFlowPosition & {
    insert?: "before" | "after";
    targetOccurrenceId?: string;
    targetRoleId?: string;
  };

export type ComponentLabPreviewOverlayVerticalOperation =
  ComponentLabPreviewOverlayPosition;

export type ComponentLabPreviewVerticalOperation =
  | ComponentLabPreviewFlowVerticalOperation
  | ComponentLabPreviewOverlayVerticalOperation;

export type ComponentLabPreviewInteractionPhase =
  | "start"
  | "preview"
  | "commit"
  | "cancel";

export type ComponentLabPreviewLayoutOperation =
  | "move"
  | "resize"
  | "flow"
  | "overlay";

export type ComponentLabPreviewRenderMessage = {
  activeBreakpoint?: ComponentDesignBreakpoint;
  component?: ComponentDesignAuthorComponent;
  composition?: readonly ComponentDesignCompositionDescriptor[];
  data: Data;
  designDocument: ComponentDesignDocument;
  device?: ComponentDesignBreakpoint;
  editingEnabled?: boolean;
  layoutMode?: boolean;
  occurrenceId?: string;
  positioningByRole?: Record<string, ComponentLabPreviewPosition>;
  protocolVersion?: typeof COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION;
  renderSessionId?: string;
  roleId?: string;
  selectedNodeId?: string;
  selectedTargets?: ComponentLabPreviewSelectionTarget[];
  seq?: number;
  showGrid: boolean;
  type: typeof COMPONENT_LAB_PREVIEW_RENDER_MESSAGE;
  variant?: string;
  viewportHeight: number;
};

export type ComponentLabPreviewReadyMessage = {
  protocolVersion: typeof COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION;
  type: typeof COMPONENT_LAB_PREVIEW_READY_MESSAGE;
};

type ComponentLabPreviewResponseContext = {
  component: ComponentDesignAuthorComponent;
  device: ComponentDesignBreakpoint;
  occurrenceId: string;
  protocolVersion: typeof COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION;
  renderSessionId: string;
  roleId: string;
  seq: number;
  variant: string;
};

export type ComponentLabPreviewHeightMessage = {
  component?: ComponentDesignAuthorComponent;
  device?: ComponentDesignBreakpoint;
  height: number;
  protocolVersion?: typeof COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION;
  renderSessionId?: string;
  seq?: number;
  type: typeof COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE;
  variant?: string;
};

export type ComponentLabPreviewSelectNodeMessage =
  ComponentLabPreviewResponseContext & {
    additive: boolean;
    nodeId: string;
    operation: "select";
    phase: "commit";
    selection: ComponentLabPreviewSelectionTarget[];
    type: typeof COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE;
  };

export type ComponentLabPreviewInteractionTarget =
  ComponentLabPreviewSelectionTarget & {
    placement: ComponentGridPlacement;
    vertical?: ComponentLabPreviewVerticalOperation;
  };

export type ComponentLabPreviewPlacementMessage =
  ComponentLabPreviewResponseContext & {
    breakpoint: ComponentDesignBreakpoint;
    nodeId: string;
    operation: ComponentLabPreviewLayoutOperation;
    phase: ComponentLabPreviewInteractionPhase;
    placement: ComponentGridPlacement;
    resizeEdge?: "left" | "right";
    targets: ComponentLabPreviewInteractionTarget[];
    type: typeof COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE;
    vertical?: ComponentLabPreviewVerticalOperation;
  };

export type ComponentLabPreviewTextChangeMessage =
  ComponentLabPreviewResponseContext & {
    nodeId: string;
    operation: "text";
    phase: Exclude<ComponentLabPreviewInteractionPhase, "start">;
    text: string;
    type: typeof COMPONENT_LAB_PREVIEW_TEXT_CHANGE_MESSAGE;
  };

export type ComponentLabPreviewInteractionMessage =
  | ComponentLabPreviewPlacementMessage
  | ComponentLabPreviewTextChangeMessage;

export type ComponentLabPreviewRenderGuardState = {
  activeRenderSessionId: string | null;
  lastSeq: number;
  retiredRenderSessionIds: readonly string[];
};

export type ComponentLabPreviewRenderGuardResult = {
  accepted: boolean;
  state: ComponentLabPreviewRenderGuardState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSequence(value: unknown): value is number {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0;
}

function isBreakpoint(value: unknown): value is ComponentDesignBreakpoint {
  return value === "desktop" || value === "tablet" || value === "mobile";
}

function isAuthorComponent(
  value: unknown,
): value is ComponentDesignAuthorComponent {
  return typeof value === "string" &&
    (COMPONENT_DESIGN_AUTHOR_COMPONENTS as readonly string[]).includes(value);
}

function isPlacement(value: unknown): value is ComponentGridPlacement {
  if (!isRecord(value)) return false;
  return typeof value.start === "number" &&
    Number.isInteger(value.start) &&
    value.start >= 1 &&
    value.start <= 12 &&
    typeof value.span === "number" &&
    Number.isInteger(value.span) &&
    value.span >= 1 &&
    value.start + value.span <= 13;
}

function isRhythm(value: unknown): value is ComponentDesignRhythmToken {
  return value === 0 ||
    value === 8 ||
    value === 16 ||
    value === 24 ||
    value === 32 ||
    value === 48 ||
    value === 64;
}

function isSelectionTarget(
  value: unknown,
): value is ComponentLabPreviewSelectionTarget {
  return isRecord(value) &&
    isNonEmptyString(value.roleId) &&
    isNonEmptyString(value.occurrenceId);
}

function isInteractionTarget(
  value: unknown,
): value is ComponentLabPreviewInteractionTarget {
  return isRecord(value) &&
    isNonEmptyString(value.roleId) &&
    isNonEmptyString(value.occurrenceId) &&
    isPlacement(value.placement) &&
    (value.vertical === undefined || isVerticalOperation(value.vertical));
}

function isVerticalOperation(
  value: unknown,
): value is ComponentLabPreviewVerticalOperation {
  if (!isRecord(value)) return false;
  if (value.mode === "flow") {
    return Number.isSafeInteger(value.order) &&
      Number(value.order) >= 0 &&
      isRhythm(value.gapBefore) &&
      (value.insert === undefined ||
        value.insert === "before" ||
        value.insert === "after") &&
      (value.targetRoleId === undefined ||
        isNonEmptyString(value.targetRoleId)) &&
      (value.targetOccurrenceId === undefined ||
        isNonEmptyString(value.targetOccurrenceId));
  }
  return value.mode === "overlay" &&
    (value.anchor === "top" ||
      value.anchor === "center" ||
      value.anchor === "bottom") &&
    typeof value.offset === "number" &&
    Number.isSafeInteger(value.offset) &&
    value.offset % 8 === 0 &&
    value.offset >= -COMPONENT_LAB_OVERLAY_OFFSET_LIMIT &&
    value.offset <= COMPONENT_LAB_OVERLAY_OFFSET_LIMIT &&
    (value.anchored === undefined || value.anchored === true);
}

function hasStrictRenderContext(
  value: Record<string, unknown>,
): value is Record<string, unknown> & {
  component: ComponentDesignAuthorComponent;
  device: ComponentDesignBreakpoint;
  protocolVersion: typeof COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION;
  renderSessionId: string;
  seq: number;
  variant: string;
} {
  return value.protocolVersion === COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION &&
    isNonEmptyString(value.renderSessionId) &&
    isSequence(value.seq) &&
    isAuthorComponent(value.component) &&
    isNonEmptyString(value.variant) &&
    isBreakpoint(value.device);
}

function hasResponseContext(
  value: Record<string, unknown>,
): value is Record<string, unknown> & ComponentLabPreviewResponseContext {
  return hasStrictRenderContext(value) &&
    isNonEmptyString(value.roleId) &&
    isNonEmptyString(value.occurrenceId);
}

function hasCanonicalComposition(
  value: Record<string, unknown> & {
    component: ComponentDesignAuthorComponent;
    variant: string;
  },
): value is typeof value & {
  composition: readonly ComponentDesignCompositionDescriptor[];
} {
  const variant = COMPONENT_DESIGN_MANIFEST_BY_COMPONENT[value.component]
    .variants.find((candidate) => candidate.id === value.variant);
  return Boolean(
    variant &&
    Array.isArray(value.composition) &&
    areJsonStructuresEqual(value.composition, variant.composition ?? []),
  );
}

export function hasComponentLabPreviewV4RenderContext(
  value: ComponentLabPreviewRenderMessage,
): value is ComponentLabPreviewRenderMessage & {
  component: ComponentDesignAuthorComponent;
  composition: readonly ComponentDesignCompositionDescriptor[];
  device: ComponentDesignBreakpoint;
  protocolVersion: typeof COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION;
  renderSessionId: string;
  seq: number;
  variant: string;
} {
  const record = value as unknown as Record<string, unknown>;
  return hasStrictRenderContext(record) && hasCanonicalComposition(record);
}

export function isComponentLabPreviewRenderMessage(
  value: unknown,
): value is ComponentLabPreviewRenderMessage {
  if (
    !isRecord(value) ||
    value.type !== COMPONENT_LAB_PREVIEW_RENDER_MESSAGE ||
    !isRecord(value.data) ||
    !isRecord(value.designDocument) ||
    (value.activeBreakpoint !== undefined && !isBreakpoint(value.activeBreakpoint)) ||
    (value.device !== undefined && !isBreakpoint(value.device)) ||
    (value.component !== undefined && !isAuthorComponent(value.component)) ||
    (value.editingEnabled !== undefined &&
      typeof value.editingEnabled !== "boolean") ||
    (value.layoutMode !== undefined && typeof value.layoutMode !== "boolean") ||
    (value.selectedNodeId !== undefined &&
      typeof value.selectedNodeId !== "string") ||
    (value.roleId !== undefined && typeof value.roleId !== "string") ||
    (value.occurrenceId !== undefined &&
      typeof value.occurrenceId !== "string") ||
    (value.variant !== undefined && typeof value.variant !== "string") ||
    typeof value.viewportHeight !== "number" ||
    !Number.isFinite(value.viewportHeight) ||
    value.viewportHeight <= 0 ||
    typeof value.showGrid !== "boolean"
  ) {
    return false;
  }
  if (
    value.activeBreakpoint !== undefined &&
    value.device !== undefined &&
    value.activeBreakpoint !== value.device
  ) {
    return false;
  }
  if (
    value.selectedTargets !== undefined &&
    (!Array.isArray(value.selectedTargets) ||
      !value.selectedTargets.every(isSelectionTarget))
  ) {
    return false;
  }
  if (
    value.positioningByRole !== undefined &&
    (!isRecord(value.positioningByRole) ||
      !Object.values(value.positioningByRole).every(isVerticalOperation))
  ) {
    return false;
  }

  // 不带 protocolVersion 的消息是过渡期旧载荷；显式声明 V4 时必须完整。
  if (value.protocolVersion === undefined) return true;
  return hasComponentLabPreviewV4RenderContext(
    value as ComponentLabPreviewRenderMessage,
  );
}

export function isComponentLabPreviewHeightMessage(
  value: unknown,
): value is ComponentLabPreviewHeightMessage {
  if (
    !isRecord(value) ||
    value.type !== COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE ||
    typeof value.height !== "number" ||
    !Number.isFinite(value.height) ||
    value.height <= 0
  ) {
    return false;
  }
  if (value.protocolVersion === undefined) return true;
  return value.protocolVersion === COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION &&
    isNonEmptyString(value.renderSessionId) &&
    isSequence(value.seq) &&
    (value.component === undefined || isAuthorComponent(value.component)) &&
    (value.variant === undefined || isNonEmptyString(value.variant)) &&
    (value.device === undefined || isBreakpoint(value.device));
}

export function isComponentLabPreviewSelectNodeMessage(
  value: unknown,
): value is ComponentLabPreviewSelectNodeMessage {
  return isRecord(value) &&
    value.type === COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE &&
    value.operation === "select" &&
    value.phase === "commit" &&
    value.additive !== undefined &&
    typeof value.additive === "boolean" &&
    typeof value.nodeId === "string" &&
    value.nodeId === value.roleId &&
    Array.isArray(value.selection) &&
    value.selection.every(isSelectionTarget) &&
    hasResponseContext(value);
}

export function isComponentLabPreviewPlacementMessage(
  value: unknown,
): value is ComponentLabPreviewPlacementMessage {
  if (
    !isRecord(value) ||
    value.type !== COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE ||
    !hasResponseContext(value) ||
    !isBreakpoint(value.breakpoint) ||
    value.breakpoint !== value.device ||
    value.nodeId !== value.roleId ||
    !(
      value.operation === "move" ||
      value.operation === "resize" ||
      value.operation === "flow" ||
      value.operation === "overlay"
    ) ||
    !(
      value.phase === "start" ||
      value.phase === "preview" ||
      value.phase === "commit" ||
      value.phase === "cancel"
    ) ||
    !isPlacement(value.placement) ||
    !Array.isArray(value.targets) ||
    value.targets.length === 0
  ) {
    return false;
  }
  if (
    value.resizeEdge !== undefined &&
    value.resizeEdge !== "left" &&
    value.resizeEdge !== "right"
  ) {
    return false;
  }
  if (
    value.vertical !== undefined &&
    !isVerticalOperation(value.vertical)
  ) {
    return false;
  }
  return value.targets.every(isInteractionTarget);
}

export function isComponentLabPreviewTextChangeMessage(
  value: unknown,
): value is ComponentLabPreviewTextChangeMessage {
  return isRecord(value) &&
    value.type === COMPONENT_LAB_PREVIEW_TEXT_CHANGE_MESSAGE &&
    value.operation === "text" &&
    (value.phase === "preview" ||
      value.phase === "commit" ||
      value.phase === "cancel") &&
    value.nodeId === value.roleId &&
    typeof value.text === "string" &&
    hasResponseContext(value);
}

export function isComponentLabPreviewInteractionMessage(
  value: unknown,
): value is ComponentLabPreviewInteractionMessage {
  return isComponentLabPreviewPlacementMessage(value) ||
    isComponentLabPreviewTextChangeMessage(value);
}

/**
 * renderSessionId 防止组件/版式切换后的旧消息回写，seq 是 iframe 生命周期内
 * 单调递增的全局序号。已经退休的会话即使迟到且序号更大，也不会重新激活。
 */
export function guardComponentLabPreviewRenderMessage(
  message: ComponentLabPreviewRenderMessage,
  state: ComponentLabPreviewRenderGuardState,
): ComponentLabPreviewRenderGuardResult {
  if (!hasComponentLabPreviewV4RenderContext(message)) {
    return {
      accepted: state.activeRenderSessionId === null,
      state,
    };
  }

  const retired = new Set(state.retiredRenderSessionIds);
  if (retired.has(message.renderSessionId)) {
    return { accepted: false, state };
  }

  if (state.activeRenderSessionId === message.renderSessionId) {
    if (message.seq <= state.lastSeq) {
      return { accepted: false, state };
    }
    return {
      accepted: true,
      state: {
        ...state,
        lastSeq: message.seq,
      },
    };
  }

  if (
    state.activeRenderSessionId !== null &&
    message.seq <= state.lastSeq
  ) {
    return { accepted: false, state };
  }
  if (state.activeRenderSessionId) {
    retired.add(state.activeRenderSessionId);
  }
  return {
    accepted: true,
    state: {
      activeRenderSessionId: message.renderSessionId,
      lastSeq: message.seq,
      retiredRenderSessionIds: [...retired],
    },
  };
}
