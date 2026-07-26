import type { Data } from "@puckeditor/core";

import type {
  ComponentDesignBreakpoint,
  ComponentDesignDocument,
  ComponentGridPlacement,
} from "./component-design-v2.ts";
import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  type ComponentDesignAuthorComponent,
} from "./component-design-manifest.ts";

export const COMPONENT_LAB_PREVIEW_RENDER_MESSAGE = "component-lab-preview-render-v2";
export const COMPONENT_LAB_PREVIEW_READY_MESSAGE = "component-lab-preview-ready-v2";
export const COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE = "component-lab-preview-height-v2";
export const COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE = "component-lab-preview-select-node-v2";
export const COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE = "component-lab-preview-placement-v2";

export type ComponentLabPreviewRenderMessage = {
  activeBreakpoint?: ComponentDesignBreakpoint;
  component?: ComponentDesignAuthorComponent;
  data: Data;
  designDocument: ComponentDesignDocument;
  layoutMode?: boolean;
  selectedNodeId?: string;
  showGrid: boolean;
  type: typeof COMPONENT_LAB_PREVIEW_RENDER_MESSAGE;
  variant?: string;
  viewportHeight: number;
};

export type ComponentLabPreviewHeightMessage = {
  height: number;
  type: typeof COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE;
};

export type ComponentLabPreviewSelectNodeMessage = {
  nodeId: string;
  type: typeof COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE;
};

export type ComponentLabPreviewPlacementMessage = {
  breakpoint: ComponentDesignBreakpoint;
  nodeId: string;
  placement: ComponentGridPlacement;
  type: typeof COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
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

export function isComponentLabPreviewRenderMessage(
  value: unknown,
): value is ComponentLabPreviewRenderMessage {
  return isRecord(value) &&
    value.type === COMPONENT_LAB_PREVIEW_RENDER_MESSAGE &&
    isRecord(value.data) &&
    isRecord(value.designDocument) &&
    (value.activeBreakpoint === undefined || isBreakpoint(value.activeBreakpoint)) &&
    (value.component === undefined || isAuthorComponent(value.component)) &&
    (value.layoutMode === undefined || typeof value.layoutMode === "boolean") &&
    (value.selectedNodeId === undefined || typeof value.selectedNodeId === "string") &&
    (value.variant === undefined || typeof value.variant === "string") &&
    typeof value.viewportHeight === "number" &&
    Number.isFinite(value.viewportHeight) &&
    value.viewportHeight > 0 &&
    typeof value.showGrid === "boolean";
}

export function isComponentLabPreviewHeightMessage(
  value: unknown,
): value is ComponentLabPreviewHeightMessage {
  return isRecord(value) &&
    value.type === COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE &&
    typeof value.height === "number" &&
    Number.isFinite(value.height) &&
    value.height > 0;
}

export function isComponentLabPreviewSelectNodeMessage(
  value: unknown,
): value is ComponentLabPreviewSelectNodeMessage {
  return isRecord(value) &&
    value.type === COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE &&
    typeof value.nodeId === "string" &&
    value.nodeId.length > 0;
}

export function isComponentLabPreviewPlacementMessage(
  value: unknown,
): value is ComponentLabPreviewPlacementMessage {
  return isRecord(value) &&
    value.type === COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE &&
    isBreakpoint(value.breakpoint) &&
    typeof value.nodeId === "string" &&
    value.nodeId.length > 0 &&
    isPlacement(value.placement);
}
