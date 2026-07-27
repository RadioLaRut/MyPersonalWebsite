import assert from "node:assert/strict";
import test from "node:test";

import {
  createComponentLabHistory,
  pushComponentLabHistory,
  redoComponentLabHistory,
  undoComponentLabHistory,
} from "./component-lab-session-history.ts";

const isEqual = (left: number, right: number) => left === right;

test("ComponentLab 会话历史按完整操作撤销和重做", () => {
  let history = createComponentLabHistory<number>();
  history = pushComponentLabHistory({
    after: 2,
    before: 1,
    history,
    isEqual,
  });
  history = pushComponentLabHistory({
    after: 3,
    before: 2,
    history,
    isEqual,
  });

  const undone = undoComponentLabHistory(history);
  assert.equal(undone.value, 2);
  assert.equal(undone.history.past.length, 1);
  assert.equal(undone.history.future.length, 1);

  const redone = redoComponentLabHistory(undone.history);
  assert.equal(redone.value, 3);
  assert.equal(redone.history.past.length, 2);
  assert.equal(redone.history.future.length, 0);
});

test("新操作清空重做分支，相同值不进入历史", () => {
  const first = pushComponentLabHistory({
    after: 2,
    before: 1,
    history: createComponentLabHistory<number>(),
    isEqual,
  });
  const undone = undoComponentLabHistory(first);
  const branched = pushComponentLabHistory({
    after: 4,
    before: 1,
    history: undone.history,
    isEqual,
  });
  const unchanged = pushComponentLabHistory({
    after: 4,
    before: 4,
    history: branched,
    isEqual,
  });

  assert.equal(branched.future.length, 0);
  assert.equal(unchanged, branched);
});
