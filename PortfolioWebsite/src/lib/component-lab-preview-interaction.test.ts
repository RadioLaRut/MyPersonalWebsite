import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getComponentLabOccurrenceId,
  pickComponentLabHitCandidate,
  resolveComponentLabPointerCoordinates,
  updateComponentLabSelection,
} from "./component-lab-preview-interaction.ts";

test("画布缩放时只修正与真实命中目标不一致的指针坐标", () => {
  const referenceRect = {
    bottom: 500,
    left: 844,
    right: 1382,
    top: 301,
  };
  const scaled = resolveComponentLabPointerCoordinates({
    clientX: 520,
    clientY: 186.6666666667,
    layoutHeight: 960,
    layoutWidth: 1440,
    referenceRect,
    renderedHeight: 448,
    renderedWidth: 672,
  });
  assert.ok(Math.abs(scaled.clientX - 1114.2857142857142) < 0.000001);
  assert.ok(Math.abs(scaled.clientY - 400) < 0.000001);
  assert.ok(Math.abs(scaled.scaleX - 2.142857142857143) < 0.000001);
  assert.ok(Math.abs(scaled.scaleY - 2.142857142857143) < 0.000001);
  assert.deepEqual(
    resolveComponentLabPointerCoordinates({
      clientX: 1114,
      clientY: 400,
      layoutHeight: 960,
      layoutWidth: 1440,
      referenceRect,
      renderedHeight: 448,
      renderedWidth: 672,
    }),
    { clientX: 1114, clientY: 400, scaleX: 1, scaleY: 1 },
  );
  assert.deepEqual(
    resolveComponentLabPointerCoordinates({
      clientX: 52,
      clientY: 100,
      layoutHeight: 960,
      layoutWidth: 1440,
      referenceRect: {
        bottom: 300,
        left: 44,
        right: 60,
        top: 80,
      },
      renderedHeight: 480,
      renderedWidth: 720,
    }),
    { clientX: 52, clientY: 100, scaleX: 1, scaleY: 1 },
  );
});

test("命中优先选择前景文字，并把满屏媒体放到最后", () => {
  const picked = pickComponentLabHitCandidate([
    {
      area: 1440 * 960,
      bleed: "viewport",
      depth: 4,
      kind: "media",
      occurrenceId: "media::0",
      roleId: "media",
      visualOrder: 0,
    },
    {
      area: 600 * 100,
      bleed: "none",
      depth: 7,
      kind: "text",
      occurrenceId: "title::0",
      roleId: "title",
      visualOrder: 1,
    },
  ]);
  assert.equal(picked?.roleId, "title");
});

test("同类目标按真实 occurrence 生成稳定身份", () => {
  assert.equal(getComponentLabOccurrenceId("item.title", 0), "0");
  assert.equal(getComponentLabOccurrenceId("item.title", 3), "3");
});

test("Shift 点击增加或移除临时多选，普通点击不破坏已有拖动集合", () => {
  const title = { occurrenceId: "title::0", roleId: "title" };
  const subtitle = { occurrenceId: "subtitle::0", roleId: "subtitle" };
  const added = updateComponentLabSelection({
    additive: true,
    current: [title],
    target: subtitle,
  });
  assert.deepEqual(added, [title, subtitle]);
  assert.deepEqual(updateComponentLabSelection({
    additive: true,
    current: added,
    target: title,
  }), [subtitle]);
  assert.deepEqual(updateComponentLabSelection({
    additive: false,
    current: added,
    target: subtitle,
  }), added);
  assert.deepEqual(updateComponentLabSelection({
    additive: false,
    current: added,
    target: { occurrenceId: "eyebrow::0", roleId: "eyebrow" },
  }), [{ occurrenceId: "eyebrow::0", roleId: "eyebrow" }]);
});

test("Lab 虚拟文字只替换 iframe 内最长文字节点，不覆盖链接结构", () => {
  const source = readFileSync(
    new URL(
      "../components/playground/ComponentLabPreviewClient.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /node\.sampleBinding\?\.kind === "virtual"/);
  assert.match(source, /replaceLongestVisibleTextNode\(element, value\)/);
  assert.match(source, /target\.data = `\$\{leading\}\$\{text\}\$\{trailing\}`/);
  assert.doesNotMatch(source, /element\.textContent\s*=\s*text/);
});

test("选框使用中文名称并在拖动时显示插入线与栏位", () => {
  const source = readFileSync(
    new URL(
      "../components/playground/ComponentLabPreviewClient.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /getElementLabel\(target\)/);
  assert.match(source, /第 \$\{occurrence \+ 1\} 项/);
  assert.match(source, /插入到\$\{descriptor\?\.label \?\? "元素"\}/);
  assert.match(source, /第 \$\{primaryTarget\.placement\.start\}–\$\{end\} 栏/);
  assert.doesNotMatch(source, />\s*\{rect\.roleId\}\s*</);
});

test("临时多选只共同移动，不显示单元素缩放手柄", () => {
  const source = readFileSync(
    new URL(
      "../components/playground/ComponentLabPreviewClient.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    source,
    /selection\.length === 1[\s\S]+data-component-lab-handle="left"/,
  );
});

test("manifest 中缺失的媒体、容器和重复角色也生成 Lab 占位", () => {
  const source = readFileSync(
    new URL(
      "../components/playground/ComponentLabPreviewClient.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /getComponentLabRepeatedOccurrenceCounts/);
  assert.doesNotMatch(source, /const repeatedOccurrenceCount = Math\.max/);
  assert.match(source, /node\.kind === "media"\s*\?\s*120/);
  assert.match(source, /sampleBinding\?\.placeholder \|\|\s*node\.label/);
});
