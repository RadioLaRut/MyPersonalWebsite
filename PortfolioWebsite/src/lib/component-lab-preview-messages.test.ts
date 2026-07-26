import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultComponentDesignDocument } from "./component-design-v2.ts";
import {
  COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE,
  COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
  isComponentLabPreviewHeightMessage,
  isComponentLabPreviewPlacementMessage,
  isComponentLabPreviewRenderMessage,
} from "./component-lab-preview-messages.ts";

test("ComponentLab 预览消息只接受完整的同源渲染载荷", () => {
  const message = {
    data: {
      content: [],
      root: { props: { title: "ComponentLab" } },
      zones: {},
    },
    activeBreakpoint: "desktop",
    component: "HeroSection",
    designDocument: createDefaultComponentDesignDocument(),
    layoutMode: true,
    selectedNodeId: "title",
    showGrid: true,
    type: COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
    variant: "poster",
    viewportHeight: 960,
  };

  assert.equal(isComponentLabPreviewRenderMessage(message), true);
  assert.equal(isComponentLabPreviewRenderMessage({ ...message, viewportHeight: 0 }), false);
  assert.equal(isComponentLabPreviewRenderMessage({ ...message, showGrid: "true" }), false);
  assert.equal(isComponentLabPreviewRenderMessage({ ...message, designDocument: null }), false);
});

test("ComponentLab 高度消息拒绝无效和非正数高度", () => {
  assert.equal(isComponentLabPreviewHeightMessage({
    height: 960,
    type: COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  }), true);
  assert.equal(isComponentLabPreviewHeightMessage({
    height: Number.NaN,
    type: COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  }), false);
  assert.equal(isComponentLabPreviewHeightMessage({
    height: -1,
    type: COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  }), false);
});

test("ComponentLab 格位消息只接受页面 12 格中的整数 start/span", () => {
  const message = {
    breakpoint: "tablet",
    nodeId: "title",
    placement: { span: 6, start: 3 },
    type: COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE,
  };

  assert.equal(isComponentLabPreviewPlacementMessage(message), true);
  assert.equal(isComponentLabPreviewPlacementMessage({
    ...message,
    placement: { span: 10, start: 4 },
  }), false);
  assert.equal(isComponentLabPreviewPlacementMessage({
    ...message,
    placement: { span: 5.5, start: 1 },
  }), false);
});
