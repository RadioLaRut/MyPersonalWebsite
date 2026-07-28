import assert from "node:assert/strict";
import test from "node:test";

import {
  constrainComponentLabPlacement,
  getComponentLabDraggedPlacement,
  getComponentLabFlowVerticalOperation,
  getComponentLabKeyboardPlacement,
  getComponentLabOverlayVerticalOperation,
  getComponentLabReorderedFlowOrders,
  hasComponentLabDragThresholdBeenCrossed,
} from "./component-lab-grid-interaction.ts";

const grid = {
  gridGap: 20,
  gridWidth: 1120,
  originClientX: 100,
  originPlacement: { span: 4, start: 3 },
} as const;

test("主体拖拽按 12 栏吸附并保持跨度", () => {
  assert.deepEqual(
    getComponentLabDraggedPlacement({
      ...grid,
      clientX: 280,
      operation: "move",
    }),
    { span: 4, start: 5 },
  );
  assert.deepEqual(
    getComponentLabDraggedPlacement({
      ...grid,
      clientX: -1000,
      operation: "move",
    }),
    { span: 4, start: 1 },
  );
});

test("左右手柄固定另一侧边界并保持合法格位", () => {
  assert.deepEqual(
    getComponentLabDraggedPlacement({
      ...grid,
      clientX: 190,
      operation: "resize-left",
    }),
    { span: 3, start: 4 },
  );
  assert.deepEqual(
    getComponentLabDraggedPlacement({
      ...grid,
      clientX: 280,
      operation: "resize-right",
    }),
    { span: 6, start: 3 },
  );
});

test("键盘移动与双边手柄调整始终保持合法格位", () => {
  assert.deepEqual(
    getComponentLabKeyboardPlacement({
      key: "ArrowRight",
      operation: "move",
      placement: { span: 4, start: 3 },
    }),
    { span: 4, start: 4 },
  );
  assert.deepEqual(
    getComponentLabKeyboardPlacement({
      key: "ArrowRight",
      operation: "resize-left",
      placement: { span: 4, start: 3 },
    }),
    { span: 3, start: 4 },
  );
  assert.deepEqual(
    getComponentLabKeyboardPlacement({
      key: "ArrowRight",
      operation: "resize-right",
      placement: { span: 4, start: 3 },
    }),
    { span: 5, start: 3 },
  );
  assert.deepEqual(
    getComponentLabKeyboardPlacement({
      key: "ArrowRight",
      operation: "resize-right",
      placement: { span: 1, start: 12 },
    }),
    { span: 1, start: 12 },
  );
});

test("composition 锁定与嵌套宿主约束不会产生非法栏位", () => {
  const currentPlacement = { span: 4, start: 3 };
  assert.deepEqual(
    constrainComponentLabPlacement({
      currentPlacement,
      lockPlacement: true,
      lockResize: false,
      operation: "move",
      requestedPlacement: { span: 4, start: 7 },
    }),
    currentPlacement,
  );
  assert.deepEqual(
    constrainComponentLabPlacement({
      currentPlacement,
      lockPlacement: false,
      lockResize: true,
      operation: "resize-right",
      requestedPlacement: { span: 8, start: 3 },
    }),
    currentPlacement,
  );
  assert.deepEqual(
    constrainComponentLabPlacement({
      currentPlacement,
      lockPlacement: false,
      lockResize: true,
      operation: "move",
      requestedPlacement: { span: 4, start: 6 },
    }),
    { span: 4, start: 6 },
  );
  assert.deepEqual(
    constrainComponentLabPlacement({
      currentPlacement,
      hostPlacement: { span: 6, start: 3 },
      lockPlacement: false,
      lockResize: false,
      operation: "move",
      requestedPlacement: { span: 12, start: 1 },
    }),
    { span: 6, start: 3 },
  );
  assert.deepEqual(
    constrainComponentLabPlacement({
      currentPlacement,
      hostPlacement: { span: 6, start: 3 },
      lockPlacement: false,
      lockResize: false,
      operation: "move",
      requestedPlacement: { span: 4, start: 10 },
    }),
    { span: 1, start: 8 },
  );
});

test("位移达到 4px 后才进入拖动", () => {
  assert.equal(hasComponentLabDragThresholdBeenCrossed({
    clientX: 102,
    clientY: 103,
    originClientX: 100,
    originClientY: 100,
  }), false);
  assert.equal(hasComponentLabDragThresholdBeenCrossed({
    clientX: 104,
    clientY: 100,
    originClientX: 100,
    originClientY: 100,
  }), true);
});

test("Flow 纵向拖动输出顺序和受控间距，不输出任意坐标", () => {
  const candidates = [
    {
      height: 40,
      occurrenceId: "eyebrow::0",
      order: 0,
      roleId: "eyebrow",
      top: 100,
    },
    {
      height: 80,
      occurrenceId: "subtitle::0",
      order: 2,
      roleId: "subtitle",
      top: 260,
    },
  ] as const;

  assert.deepEqual(
    getComponentLabFlowVerticalOperation({
      candidates,
      clientY: 205,
      originClientY: 200,
      originGapBefore: 16,
      originOrder: 1,
      originRect: { height: 60, top: 180 },
    }),
    {
      gapBefore: 24,
      insert: "before",
      mode: "flow",
      order: 1,
      targetOccurrenceId: "subtitle::0",
      targetRoleId: "subtitle",
    },
  );
  assert.deepEqual(
    getComponentLabFlowVerticalOperation({
      candidates,
      clientY: 340,
      originClientY: 200,
      originGapBefore: 16,
      originOrder: 1,
      originRect: { height: 60, top: 180 },
    }),
    {
      gapBefore: 16,
      insert: "after",
      mode: "flow",
      order: 2,
      targetOccurrenceId: "subtitle::0",
      targetRoleId: "subtitle",
    },
  );
});

test("Overlay 纵向拖动输出最近锚点和 8px 偏移", () => {
  assert.deepEqual(
    getComponentLabOverlayVerticalOperation({
      clientY: 188,
      originClientY: 100,
      originRect: { height: 80, top: 360 },
      rootHeight: 960,
      rootTop: 0,
    }),
    {
      anchor: "center",
      anchored: true,
      mode: "overlay",
      offset: 8,
    },
  );
  const bottom = getComponentLabOverlayVerticalOperation({
    clientY: 700,
    originClientY: 100,
    originRect: { height: 80, top: 300 },
    rootHeight: 960,
    rootTop: 0,
  });
  assert.equal(bottom.anchor, "bottom");
  assert.equal(bottom.offset % 8, 0);
});

test("Overlay 极端纵向拖动仍限制为正负 320px 且保持 8px 步进", () => {
  const upward = getComponentLabOverlayVerticalOperation({
    clientY: -10_000,
    originClientY: 100,
    originRect: { height: 80, top: 360 },
    rootHeight: 960,
    rootTop: 0,
  });
  const downward = getComponentLabOverlayVerticalOperation({
    clientY: 10_000,
    originClientY: 100,
    originRect: { height: 80, top: 360 },
    rootHeight: 960,
    rootTop: 0,
  });

  assert.equal(upward.offset, -320);
  assert.equal(downward.offset, 320);
  assert.equal(Number.isInteger(upward.offset / 8), true);
  assert.equal(Number.isInteger(downward.offset / 8), true);
});

test("Overlay 使用非零 grid 根坐标计算锚点，不回退到 iframe 顶部", () => {
  assert.deepEqual(
    getComponentLabOverlayVerticalOperation({
      clientY: 188,
      originClientY: 100,
      originRect: { height: 80, top: 420 },
      rootHeight: 600,
      rootTop: 240,
    }),
    {
      anchor: "center",
      anchored: true,
      mode: "overlay",
      offset: 8,
    },
  );
});

test("Flow 重排同步重编号其他角色且 repeated occurrence 共享顺序", () => {
  assert.deepEqual(
    getComponentLabReorderedFlowOrders({
      insertionIndex: 0,
      items: [
        { occurrenceId: "0", order: 0, roleId: "eyebrow" },
        { occurrenceId: "0", order: 1, roleId: "title" },
        { occurrenceId: "1", order: 1, roleId: "title" },
        { occurrenceId: "0", order: 2, roleId: "subtitle" },
      ],
      movingRoleIds: ["subtitle"],
    }),
    {
      eyebrow: 1,
      subtitle: 0,
      title: 2,
    },
  );
});
