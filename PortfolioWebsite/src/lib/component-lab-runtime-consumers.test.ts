import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("沉浸式项目锁线由独立 ComponentLayoutNode 消费版式规则", () => {
  const source = readSource("src/components/home/ProjectSection.tsx");

  assert.match(
    source,
    /<ComponentLayoutNode[\s\S]*?nodeId="underline"[\s\S]*?>/,
  );
  assert.doesNotMatch(source, /data-component-lab-node="underline"/);
  assert.match(source, /--project-underline-offset-mobile/);
  assert.match(source, /hasActiveUnderlinePositioning\("desktop"\)/);
  assert.match(
    source,
    /className=\{sectionClassName\}[\s\S]*?style=\{getComponentSectionStyle\(componentLayout\)\}/,
  );
  assert.doesNotMatch(
    source,
    /className=\{`absolute inset-0[\s\S]*?style=\{getComponentSectionStyle\(componentLayout\)\}/,
  );
});

test("作品列表媒体保持整条目背景并只在交互或 Lab 预览时显示", () => {
  const entrySource = readSource(
    "src/components/works/WorksListEntry.tsx",
  );
  const activationSource = readSource(
    "src/components/works/WorksListEntryActivation.tsx",
  );

  assert.doesNotMatch(entrySource, /nodeId="item\.media"/);
  assert.match(entrySource, /componentLabAnnotations=\{forceLabPreview\}/);
  assert.match(entrySource, /forceVisible=\{forceLabPreview\}/);
  assert.doesNotMatch(entrySource, /!editMode && imageSrc/);
  assert.match(activationSource, /forceVisible = false/);
  assert.match(activationSource, /forceVisible[\s\S]*?"opacity-100"/);
  assert.match(
    activationSource,
    /pointer-events-none absolute inset-0 z-0 overflow-hidden/,
  );
  assert.match(activationSource, /data-component-lab-node=\{componentLabAnnotations/);
  assert.match(activationSource, /group-data-\[active=true\]:opacity-100/);
  assert.match(activationSource, /frameClassName="h-full w-full"/);
  assert.doesNotMatch(activationSource, /\bcontained\b/);
});

test("参数条目保持子网格并由 items 容器消费自身版式", () => {
  const source = readSource("src/components/breakdowns/ParameterGrid.tsx");

  assert.match(
    source,
    /<ComponentLayoutNode[\s\S]*?className=\{`grid-subgrid[\s\S]*?nodeId="items"/,
  );
  assert.match(source, /<article[\s\S]*?className=\{`group grid-subgrid/);
  assert.match(source, /nodeId="item\.name"[\s\S]*?occurrence=\{index\}/);
  assert.match(source, /nodeId="item\.value"[\s\S]*?occurrence=\{index\}/);
  assert.match(source, /nodeId="item\.description"[\s\S]*?occurrence=\{index\}/);
});

test("Lab 拖拽优先使用组件内部十二栏宿主", () => {
  const source = readSource(
    "src/components/playground/ComponentLabPreviewClient.tsx",
  );

  assert.match(
    source,
    /\.grid-subgrid, \.grid-container/,
  );
  assert.match(source, /getClosestGridElement\(primaryElement\)/);
});

test("全屏图注和媒体标签使用覆盖完整媒体的稳定网格根", () => {
  const imagePanelSource = readSource(
    "src/components/breakdowns/ImagePanel.tsx",
  );
  const parameterGridSource = readSource(
    "src/components/breakdowns/ParameterGrid.tsx",
  );

  for (const source of [imagePanelSource, parameterGridSource]) {
    assert.match(
      source,
      /pointer-events-none absolute inset-0 z-10[\s\S]*?grid-container h-full/,
    );
    assert.doesNotMatch(source, /grid-container absolute/);
    assert.match(source, /grid-container h-full/);
  }

  assert.match(imagePanelSource, /pointer-events-auto self-end pb-5 md:pb-8/);
  assert.match(parameterGridSource, /pointer-events-auto self-start pt-4/);
});

test("Lab 角色标注只通过渲染表面开关输出", () => {
  const sources = [
    "src/components/home/ProjectSection.tsx",
    "src/components/breakdowns/ParameterGrid.tsx",
    "src/components/breakdowns/ImagePanel.tsx",
    "src/components/blocks/NextProjectBlock.tsx",
  ].map(readSource);

  for (const source of sources) {
    assert.doesNotMatch(source, /data-component-lab-node=/);
    assert.match(source, /getComponentLabNodeAttributes/);
  }
});

test("下一项目背景随版式高度并恢复移动端四成、桌面六成视口", () => {
  const source = readSource("src/components/blocks/NextProjectBlock.tsx");

  assert.match(source, /mediaHeightClassName/);
  assert.match(source, /h-\[calc\(var\(--site-viewport-unit\)\*40\)\]/);
  assert.match(source, /md:h-\[calc\(var\(--site-viewport-unit\)\*60\)\]/);
  assert.match(source, /lg:h-\[calc\(var\(--site-viewport-unit\)\*60\)\]/);
  assert.match(source, /componentLayout\?\.section\?\.mobile\.height/);
  assert.match(source, /getComponentLabNodeAttributes\(componentLayout, "media"\)/);
});

test("Lighting 卡片不会重复内容数据中已有的 Collection 前缀", () => {
  const source = readSource("src/components/works/LightingProjectCard.tsx");

  assert.match(source, /hasCollectionPrefix/);
  assert.match(source, /\^collection\(\?:\\s\|\$\)\/i/);
  assert.match(
    source,
    /\{hasCollectionPrefix \? number : <>Collection \{number\}<\/>\}/,
  );
});

test("ComponentLab 工作台外壳不会强制桌面宽度并保留三档响应式区域", () => {
  const client = readSource("src/components/playground/ComponentLabClient.tsx");
  const inspector = readSource(
    "src/components/playground/component-lab/ComponentLabInspector.tsx",
  );
  const toolbar = readSource(
    "src/components/playground/component-lab/ComponentLabToolbar.tsx",
  );

  assert.doesNotMatch(client, /min-w-\[1100px\]/);
  assert.match(client, /md:grid-cols-\[220px_minmax\(0,1fr\)\]/);
  assert.match(
    client,
    /min-\[1100px\]:grid-cols-\[260px_minmax\(0,1fr\)_300px\]/,
  );
  assert.match(inspector, /md:col-span-2/);
  assert.match(inspector, /min-\[1100px\]:col-start-3/);
  assert.match(toolbar, /flex-wrap/);
});

test("组件只保留一棵 canonical render tree", () => {
  const sources = [
    "src/components/blocks/ContactFlashlightBlock.tsx",
    "src/components/blocks/NextProjectBlock.tsx",
    "src/components/breakdowns/BreakdownHeadline.tsx",
    "src/components/breakdowns/BreakdownTriptych.tsx",
    "src/components/breakdowns/ContentCard.tsx",
    "src/components/breakdowns/HighDensityInfoBlock.tsx",
    "src/components/breakdowns/ImagePanel.tsx",
    "src/components/breakdowns/ImageSlider.tsx",
    "src/components/breakdowns/ParameterGrid.tsx",
    "src/components/breakdowns/TextSplitLayout.tsx",
    "src/components/home/HeroSection.tsx",
    "src/components/home/HomeEndcapSection.tsx",
    "src/components/home/ProjectSection.tsx",
    "src/components/media/BilibiliEmbed.tsx",
    "src/components/works/LightingCollectionHeader.tsx",
    "src/components/works/LightingProjectCard.tsx",
    "src/components/works/PortfolioHeroHeader.tsx",
    "src/components/works/WorksList.tsx",
    "src/components/works/WorksListEntry.tsx",
  ].map(readSource);

  for (const source of sources) {
    assert.doesNotMatch(source, /if\s*\(\s*componentLayout\s*\)/);
    assert.doesNotMatch(
      source,
      /componentLayout\s*\?\s*render[A-Z]\w+\(/,
    );
  }
});

test("Action 对齐作用于元素盒子，内部文字保持居中", () => {
  const sources = [
    "src/components/common/HeroHeadlineBlock.tsx",
    "src/components/home/HeroSection.tsx",
    "src/components/home/HomeEndcapSection.tsx",
    "src/components/media/BilibiliEmbed.tsx",
    "src/components/works/LightingCollectionHeader.tsx",
    "src/components/works/PortfolioHeroHeader.tsx",
    "src/components/blocks/ContactFlashlightBlock.tsx",
  ].map(readSource);

  for (const source of sources) {
    assert.match(source, /alignmentTarget="box"/);
    assert.match(source, /align="center"/);
  }
});
