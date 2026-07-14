import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultComponentDesignDocument } from "./component-design-schema.ts";
import {
  COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
  isComponentLabPreviewHeightMessage,
  isComponentLabPreviewRenderMessage,
} from "./component-lab-preview-messages.ts";

test("ComponentLab 预览消息只接受完整的同源渲染载荷", () => {
  const message = {
    data: {
      content: [],
      root: { props: { title: "ComponentLab" } },
      zones: {},
    },
    designDocument: createDefaultComponentDesignDocument(),
    showGrid: true,
    type: COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
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
