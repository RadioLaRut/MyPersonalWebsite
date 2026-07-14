import type { Data } from "@puckeditor/core";

import type { ComponentDesignDocument } from "./component-design-schema";

export const COMPONENT_LAB_PREVIEW_RENDER_MESSAGE = "component-lab-preview-render";
export const COMPONENT_LAB_PREVIEW_READY_MESSAGE = "component-lab-preview-ready";
export const COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE = "component-lab-preview-height";

export type ComponentLabPreviewRenderMessage = {
  data: Data;
  designDocument: ComponentDesignDocument;
  showGrid: boolean;
  type: typeof COMPONENT_LAB_PREVIEW_RENDER_MESSAGE;
  viewportHeight: number;
};

export type ComponentLabPreviewHeightMessage = {
  height: number;
  type: typeof COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE;
};

export function isComponentLabPreviewRenderMessage(
  value: unknown,
): value is ComponentLabPreviewRenderMessage {
  return Boolean(
    value &&
    typeof value === "object" &&
    "type" in value &&
    value.type === COMPONENT_LAB_PREVIEW_RENDER_MESSAGE &&
    "data" in value &&
    value.data &&
    typeof value.data === "object" &&
    "designDocument" in value &&
    value.designDocument &&
    typeof value.designDocument === "object" &&
    "viewportHeight" in value &&
    typeof value.viewportHeight === "number" &&
    Number.isFinite(value.viewportHeight) &&
    value.viewportHeight > 0 &&
    "showGrid" in value &&
    typeof value.showGrid === "boolean",
  );
}

export function isComponentLabPreviewHeightMessage(
  value: unknown,
): value is ComponentLabPreviewHeightMessage {
  return Boolean(
    value &&
    typeof value === "object" &&
    "type" in value &&
    value.type === COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE &&
    "height" in value &&
    typeof value.height === "number" &&
    Number.isFinite(value.height) &&
    value.height > 0,
  );
}
