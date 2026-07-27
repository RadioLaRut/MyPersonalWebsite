import assert from "node:assert/strict";
import test from "node:test";

import {
  getComponentDesignVariantDescriptor,
} from "./component-design-manifest.ts";
import {
  getComponentLabRepeatedOccurrenceCounts,
} from "./component-lab-repeated-occurrences.ts";

test("Contact 客户与工作经历按各自数据源独立计数", () => {
  const counts = getComponentLabRepeatedOccurrenceCounts({
    actualCounts: {
      "clients.item": 3,
      "employment.item": 1,
    },
    descriptor: getComponentDesignVariantDescriptor(
      "ContactFlashlight",
      "default",
    ),
    sampleText: {
      "clients.item": ["客户甲", "客户乙", "客户丙"],
      "employment.item": ["经历甲"],
    },
  });

  assert.equal(counts["clients.item"], 3);
  assert.equal(counts["employment.item"], 1);
});

test("ThreeColumn 各栏重复集合互不制造 occurrence，同栏角色共享数量", () => {
  const counts = getComponentLabRepeatedOccurrenceCounts({
    actualCounts: {
      "column1.item.label": 2,
      "column1.item.value": 2,
      "column2.item.label": 4,
      "column2.item.value": 4,
    },
    descriptor: getComponentDesignVariantDescriptor(
      "ThreeColumnSection",
      "phase",
    ),
    sampleText: {
      "column1.item.label": ["一", "二"],
      "column1.item.value": ["1", "2"],
      "column2.item.label": ["一", "二", "三", "四"],
      "column2.item.value": ["1", "2", "3", "4"],
    },
  });

  assert.equal(counts["column1.item.label"], 2);
  assert.equal(counts["column1.item.value"], 2);
  assert.equal(counts["column2.item.label"], 4);
  assert.equal(counts["column2.item.value"], 4);
});

test("WorksList 可选媒体跟随 entries 集合，不借用其他分组数量", () => {
  const descriptor = getComponentDesignVariantDescriptor(
    "WorksList",
    "default",
  );
  const counts = getComponentLabRepeatedOccurrenceCounts({
    actualCounts: {
      "item.media": 1,
      "item.number": 3,
      "item.title": 3,
    },
    descriptor,
    sampleText: {
      "item.number": ["01", "02", "03"],
      "item.title": ["甲", "乙", "丙"],
      unrelated: ["1", "2", "3", "4", "5", "6"],
    },
  });

  assert.equal(counts["item.number"], 3);
  assert.equal(counts["item.title"], 3);
  assert.equal(counts["item.media"], 3);
});
