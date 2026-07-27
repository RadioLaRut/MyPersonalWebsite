import assert from "node:assert/strict";
import test from "node:test";

import {
  createNestedComponentVariantLayout,
  mapPlacementToNestedTwelveColumnGrid,
} from "./component-design-nested-grid.ts";
import type {
  ComponentResponsiveValue,
  ComponentGridPlacement,
  ComponentVariantLayout,
} from "./component-design-v2.ts";

const parentPlacements = [
  { span: 4, start: 1 },
  { span: 4, start: 5 },
  { span: 4, start: 9 },
] as const;

test("全局父格 1/4、5/4、9/4 均映射为嵌套 12 栏", () => {
  for (const parent of parentPlacements) {
    assert.deepEqual(
      mapPlacementToNestedTwelveColumnGrid(parent, parent),
      { span: 12, start: 1 },
    );

    assert.deepEqual(
      mapPlacementToNestedTwelveColumnGrid(parent, {
        span: 2,
        start: parent.start + 1,
      }),
      { span: 6, start: 4 },
    );
  }
});

test("只换算指定父节点的后代并保留其余布局元数据", () => {
  const responsiveParentPlacement: ComponentResponsiveValue<ComponentGridPlacement> = {
    desktop: parentPlacements[0],
    mobile: parentPlacements[2],
    tablet: parentPlacements[1],
  };
  const unrelatedPlacement: ComponentResponsiveValue<ComponentGridPlacement> = {
    desktop: { span: 3, start: 10 },
    mobile: { span: 12, start: 1 },
    tablet: { span: 6, start: 7 },
  };
  const section: NonNullable<ComponentVariantLayout["section"]> = {
    desktop: {
      gap: 24,
      height: "normal",
      paddingBottom: 32,
      paddingTop: 32,
      profile: "normal",
    },
    mobile: {
      gap: 16,
      height: "auto",
      paddingBottom: 24,
      paddingTop: 24,
      profile: "compact",
    },
    tablet: {
      gap: 24,
      height: "normal",
      paddingBottom: 32,
      paddingTop: 32,
      profile: "normal",
    },
  };
  const layout: ComponentVariantLayout = {
    componentLabAnnotations: true,
    gaps: {},
    nodes: {
      column1: {
        placement: responsiveParentPlacement,
      },
      "column1.title": {
        opticalPull: 8,
        placement: responsiveParentPlacement,
      },
      "column2.title": {
        placement: unrelatedPlacement,
      },
    },
    section,
    sectionProfile: "hero",
  };

  const nestedLayout = createNestedComponentVariantLayout(layout, "column1");

  assert.notStrictEqual(nestedLayout, layout);
  assert.deepEqual(nestedLayout.nodes["column1.title"].placement, {
    desktop: { span: 12, start: 1 },
    mobile: { span: 12, start: 1 },
    tablet: { span: 12, start: 1 },
  });
  assert.equal(nestedLayout.nodes["column1.title"].opticalPull, 8);
  assert.strictEqual(nestedLayout.nodes.column1, layout.nodes.column1);
  assert.strictEqual(
    nestedLayout.nodes["column2.title"],
    layout.nodes["column2.title"],
  );
  assert.strictEqual(nestedLayout.gaps, layout.gaps);
  assert.strictEqual(nestedLayout.section, section);
  assert.equal(nestedLayout.componentLabAnnotations, true);
  assert.equal(nestedLayout.sectionProfile, "hero");
});

test("父节点不存在时返回原布局", () => {
  const layout: ComponentVariantLayout = {
    gaps: {},
    nodes: {},
    sectionProfile: "normal",
  };

  assert.strictEqual(
    createNestedComponentVariantLayout(layout, "missing"),
    layout,
  );
});
