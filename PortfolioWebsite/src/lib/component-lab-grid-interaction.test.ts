import assert from "node:assert/strict";
import test from "node:test";

import {
  getComponentLabDraggedPlacement,
  getComponentLabKeyboardPlacement,
} from "./component-lab-grid-interaction.ts";

const grid = {
  gridGap: 20,
  gridWidth: 1120,
  originClientX: 100,
  originPlacement: { span: 4, start: 3 },
} as const;

test("主体拖拽按整格吸附并保持跨度", () => {
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

test("左边缘缩放固定右边界，右边缘缩放固定起始格", () => {
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
