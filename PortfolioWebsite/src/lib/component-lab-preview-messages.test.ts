import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultComponentDesignDocument } from "./component-design-v2.ts";
import {
  COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE,
  COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
  COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
  COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE,
  COMPONENT_LAB_PREVIEW_TEXT_CHANGE_MESSAGE,
  guardComponentLabPreviewRenderMessage,
  isComponentLabPreviewHeightMessage,
  isComponentLabPreviewPlacementMessage,
  isComponentLabPreviewRenderMessage,
  isComponentLabPreviewSelectNodeMessage,
  isComponentLabPreviewTextChangeMessage,
  type ComponentLabPreviewRenderMessage,
} from "./component-lab-preview-messages.ts";

function createRenderMessage(
  seq = 1,
  renderSessionId = "hero-default",
): ComponentLabPreviewRenderMessage {
  return {
    data: {
      content: [],
      root: { props: { title: "ComponentLab" } },
      zones: {},
    },
    activeBreakpoint: "desktop",
    component: "HeroSection",
    designDocument: createDefaultComponentDesignDocument(),
    device: "desktop",
    layoutMode: true,
    occurrenceId: "title::0",
    protocolVersion: COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
    renderSessionId,
    roleId: "title",
    selectedNodeId: "title",
    selectedTargets: [{ occurrenceId: "title::0", roleId: "title" }],
    seq,
    showGrid: true,
    type: COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
    variant: "poster",
    viewportHeight: 960,
  };
}

function createResponseContext() {
  return {
    component: "HeroSection",
    device: "desktop",
    occurrenceId: "title::0",
    protocolVersion: COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
    renderSessionId: "hero-default",
    roleId: "title",
    seq: 8,
    variant: "poster",
  } as const;
}

test("V3 渲染消息要求完整会话上下文，仍兼容未声明版本的旧载荷", () => {
  const message = createRenderMessage();
  assert.equal(isComponentLabPreviewRenderMessage(message), true);
  assert.equal(isComponentLabPreviewRenderMessage({
    ...message,
    activeBreakpoint: "tablet",
  }), false);
  assert.equal(isComponentLabPreviewRenderMessage({
    ...message,
    renderSessionId: "",
  }), false);
  assert.equal(isComponentLabPreviewRenderMessage({
    ...message,
    seq: -1,
  }), false);
  assert.equal(isComponentLabPreviewRenderMessage({
    ...message,
    editingEnabled: "false",
  }), false);
  assert.equal(isComponentLabPreviewRenderMessage({
    ...message,
    viewportHeight: 0,
  }), false);
  assert.equal(isComponentLabPreviewRenderMessage({
    ...message,
    positioningByRole: {
      title: { anchor: "center", mode: "overlay", offset: 328 },
    },
  }), false);
  assert.equal(isComponentLabPreviewRenderMessage({
    ...message,
    positioningByRole: {
      title: {
        anchor: "center",
        anchored: false,
        mode: "overlay",
        offset: 0,
      },
    },
  }), false);

  const legacy: Record<string, unknown> = { ...message };
  delete legacy.device;
  delete legacy.protocolVersion;
  delete legacy.renderSessionId;
  delete legacy.seq;
  assert.equal(isComponentLabPreviewRenderMessage(legacy), true);
});

test("渲染守卫拒绝重复、乱序和已经退休的会话", () => {
  const initialState = {
    activeRenderSessionId: null,
    lastSeq: -1,
    retiredRenderSessionIds: [],
  };
  const first = guardComponentLabPreviewRenderMessage(
    createRenderMessage(1, "session-a"),
    initialState,
  );
  assert.equal(first.accepted, true);
  assert.equal(
    guardComponentLabPreviewRenderMessage(
      createRenderMessage(1, "session-a"),
      first.state,
    ).accepted,
    false,
  );
  const switched = guardComponentLabPreviewRenderMessage(
    createRenderMessage(2, "session-b"),
    first.state,
  );
  assert.equal(switched.accepted, true);
  assert.deepEqual(switched.state.retiredRenderSessionIds, ["session-a"]);
  assert.equal(
    guardComponentLabPreviewRenderMessage(
      createRenderMessage(3, "session-a"),
      switched.state,
    ).accepted,
    false,
  );
  assert.equal(
    guardComponentLabPreviewRenderMessage(
      createRenderMessage(1, "session-c"),
      switched.state,
    ).accepted,
    false,
  );
  const legacy: Record<string, unknown> = {
    ...createRenderMessage(4, "legacy-late"),
  };
  delete legacy.device;
  delete legacy.protocolVersion;
  delete legacy.renderSessionId;
  delete legacy.seq;
  assert.equal(isComponentLabPreviewRenderMessage(legacy), true);
  assert.equal(
    guardComponentLabPreviewRenderMessage(
      legacy as ComponentLabPreviewRenderMessage,
      switched.state,
    ).accepted,
    false,
  );
});

test("高度消息拒绝无效高度和不完整的 V3 会话", () => {
  assert.equal(isComponentLabPreviewHeightMessage({
    height: 960,
    type: COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  }), true);
  assert.equal(isComponentLabPreviewHeightMessage({
    height: Number.NaN,
    type: COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  }), false);
  assert.equal(isComponentLabPreviewHeightMessage({
    height: 960,
    protocolVersion: COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
    type: COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  }), false);
});

test("选择消息携带 Shift 多选结果和完整元素身份", () => {
  const message = {
    ...createResponseContext(),
    additive: true,
    nodeId: "title",
    operation: "select",
    phase: "commit",
    selection: [
      { occurrenceId: "eyebrow::0", roleId: "eyebrow" },
      { occurrenceId: "title::0", roleId: "title" },
    ],
    type: COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE,
  };
  assert.equal(isComponentLabPreviewSelectNodeMessage(message), true);
  assert.equal(isComponentLabPreviewSelectNodeMessage({
    ...message,
    occurrenceId: "",
  }), false);
});

test("布局 interaction 同时校验 12 栏和 Flow/Overlay 语义", () => {
  const message = {
    ...createResponseContext(),
    breakpoint: "desktop",
    nodeId: "title",
    operation: "flow",
    phase: "commit",
    placement: { span: 6, start: 3 },
    targets: [{
      occurrenceId: "title::0",
      placement: { span: 6, start: 3 },
      roleId: "title",
      vertical: { gapBefore: 16, mode: "flow", order: 1 },
    }],
    type: COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE,
    vertical: { gapBefore: 16, mode: "flow", order: 1 },
  };
  assert.equal(isComponentLabPreviewPlacementMessage(message), true);
  assert.equal(isComponentLabPreviewPlacementMessage({
    ...message,
    placement: { span: 10, start: 4 },
  }), false);
  assert.equal(isComponentLabPreviewPlacementMessage({
    ...message,
    vertical: { anchor: "center", mode: "overlay", offset: 7 },
  }), false);
});

test("Overlay interaction 拒绝超过正负 320px 的根节点与多选目标偏移", () => {
  const message = {
    ...createResponseContext(),
    breakpoint: "desktop",
    nodeId: "title",
    operation: "overlay",
    phase: "commit",
    placement: { span: 6, start: 3 },
    targets: [{
      occurrenceId: "title::0",
      placement: { span: 6, start: 3 },
      roleId: "title",
      vertical: {
        anchor: "center",
        anchored: true,
        mode: "overlay",
        offset: 320,
      },
    }],
    type: COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE,
    vertical: {
      anchor: "center",
      anchored: true,
      mode: "overlay",
      offset: -320,
    },
  } as const;

  assert.equal(isComponentLabPreviewPlacementMessage(message), true);
  assert.equal(isComponentLabPreviewPlacementMessage({
    ...message,
    vertical: { anchor: "center", mode: "overlay", offset: 328 },
  }), false);
  assert.equal(isComponentLabPreviewPlacementMessage({
    ...message,
    vertical: {
      anchor: "center",
      anchored: false,
      mode: "overlay",
      offset: 0,
    },
  }), false);
  assert.equal(isComponentLabPreviewPlacementMessage({
    ...message,
    targets: [{
      ...message.targets[0],
      vertical: { anchor: "bottom", mode: "overlay", offset: -328 },
    }],
  }), false);
});

test("文字 interaction 区分重复 occurrence 并接受 preview/commit/cancel", () => {
  const message = {
    ...createResponseContext(),
    nodeId: "title",
    operation: "text",
    phase: "preview",
    text: "新的标题",
    type: COMPONENT_LAB_PREVIEW_TEXT_CHANGE_MESSAGE,
  };
  assert.equal(isComponentLabPreviewTextChangeMessage(message), true);
  assert.equal(isComponentLabPreviewTextChangeMessage({
    ...message,
    phase: "start",
  }), false);
  assert.equal(isComponentLabPreviewTextChangeMessage({
    ...message,
    nodeId: "subtitle",
  }), false);
});
