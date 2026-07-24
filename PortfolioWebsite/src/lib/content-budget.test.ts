import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAggregateContentQuota,
  ContentBudgetExceededError,
  ContentQuotaExceededError,
  inspectJsonContent,
  type JsonContentBudget,
} from "./content-budget.ts";

const SMALL_BUDGET: JsonContentBudget = {
  maxArrayLength: 2,
  maxBytes: 64,
  maxDepth: 3,
  maxObjectKeys: 2,
  maxPuckComponents: 1,
  maxStringCodePoints: 4,
  maxValues: 6,
};

test("iterative JSON budget reports metrics at the configured boundary", () => {
  const metrics = inspectJsonContent({ a: ["字", true] }, SMALL_BUDGET);

  assert.equal(metrics.depth, 3);
  assert.equal(metrics.maxArrayLength, 2);
  assert.equal(metrics.maxObjectKeys, 1);
  assert.equal(metrics.values, 4);
});

test("each JSON budget dimension rejects the first value beyond its limit", () => {
  const invalidValues = [
    { budget: SMALL_BUDGET, value: { a: { b: { c: true } } }, pattern: /depth/u },
    { budget: SMALL_BUDGET, value: [1, 2, 3], pattern: /array length/u },
    { budget: SMALL_BUDGET, value: { a: 1, b: 2, c: 3 }, pattern: /object key count/u },
    { budget: SMALL_BUDGET, value: "12345", pattern: /string length/u },
    {
      budget: SMALL_BUDGET,
      value: { a: [1, 2], b: [3, 4] },
      pattern: /value count/u,
    },
    {
      budget: {
        ...SMALL_BUDGET,
        maxDepth: 4,
        maxStringCodePoints: 8,
        maxValues: 20,
      },
      value: [
        { props: {}, type: "One" },
        { props: {}, type: "Two" },
      ],
      pattern: /component count/u,
    },
  ];

  for (const { budget, pattern, value } of invalidValues) {
    assert.throws(
      () => inspectJsonContent(value, budget),
      (error) => error instanceof ContentBudgetExceededError && pattern.test(error.message),
    );
  }
});

test("JSON budget rejects cycles, non-finite numbers, and byte overflow", () => {
  const cyclic: unknown[] = [];
  cyclic.push(cyclic);

  assert.throws(() => inspectJsonContent(cyclic, SMALL_BUDGET), /cycles/u);
  assert.throws(() => inspectJsonContent(Number.NaN, SMALL_BUDGET), /finite/u);
  assert.throws(
    () => inspectJsonContent("🙂🙂🙂🙂", { ...SMALL_BUDGET, maxBytes: 8 }),
    /UTF-8 size/u,
  );
});

test("aggregate quota accounts for replacement and rejects the next file or byte", () => {
  assert.deepEqual(
    assertAggregateContentQuota(
      { bytes: 8, files: 2, replacedBytes: 3, replacesExisting: true },
      4,
      { maxBytes: 9, maxFiles: 2 },
    ),
    { bytes: 9, files: 2 },
  );
  assert.throws(
    () => assertAggregateContentQuota(
      { bytes: 8, files: 2 },
      1,
      { maxBytes: 10, maxFiles: 2 },
    ),
    ContentQuotaExceededError,
  );
  assert.throws(
    () => assertAggregateContentQuota(
      { bytes: 8, files: 1 },
      3,
      { maxBytes: 10, maxFiles: 2 },
    ),
    ContentQuotaExceededError,
  );
});
