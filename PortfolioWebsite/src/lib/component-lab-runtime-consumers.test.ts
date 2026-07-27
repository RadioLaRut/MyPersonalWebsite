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

test("作品列表实际媒体由可调整框体的 ComponentLayoutNode 承载", () => {
  const entrySource = readSource(
    "src/components/works/WorksListEntry.tsx",
  );
  const activationSource = readSource(
    "src/components/works/WorksListEntryActivation.tsx",
  );

  assert.match(
    entrySource,
    /<ComponentLayoutNode[\s\S]*?nodeId="item\.media"[\s\S]*?>/,
  );
  assert.doesNotMatch(
    entrySource,
    /data-component-lab-node="item\.media"/,
  );
  assert.match(entrySource, /<WorksListEntryActivation\s+contained/);
  assert.match(entrySource, /forceVisible=\{editMode\}/);
  assert.doesNotMatch(entrySource, /!editMode && imageSrc/);
  assert.match(activationSource, /forceVisible = false/);
  assert.match(activationSource, /forceVisible[\s\S]*?"opacity-100"/);
  assert.match(activationSource, /contained \? undefined : false/);
  assert.match(
    activationSource,
    /frameClassName=\{contained \? "w-full" : "h-full w-full"\}/,
  );
});

test("参数条目保持子网格并由 items 容器消费自身版式", () => {
  const source = readSource("src/components/breakdowns/ParameterGrid.tsx");

  assert.match(
    source,
    /<ComponentLayoutNode[\s\S]*?className="grid-subgrid"[\s\S]*?nodeId="items"/,
  );
  assert.match(source, /gapFrom=\{index === 0 \? "items" : "item\.name"\}/);
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
    assert.match(
      source,
      /grid-container h-full">\s*\{has(?:Caption|EditableTextContent)/,
    );
  }

  assert.match(imagePanelSource, /self-end \$\{captionDefaultOffsetClassName\}/);
  assert.match(imagePanelSource, /"mb-6"/);
  assert.match(
    parameterGridSource,
    /self-start \$\{mediaLabelDefaultOffsetClassName\}/,
  );
  assert.match(parameterGridSource, /"mt-4"/);
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

test("下一项目背景高度随版式整体高度并保留默认六成视口", () => {
  const source = readSource("src/components/blocks/NextProjectBlock.tsx");

  assert.match(source, /grid-rows-\[minmax\(0,1fr\)_auto\]/);
  assert.match(source, /mediaHeightClassName/);
  assert.match(source, /min-h-\[calc\(var\(--site-viewport-unit\)\*60\)\]/);
  assert.match(source, /componentLayout\.section\?\.mobile\.height/);
});
