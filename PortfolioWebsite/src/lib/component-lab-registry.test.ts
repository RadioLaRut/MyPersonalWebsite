import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const registryPath = path.resolve(
  process.cwd(),
  "src/components/playground/component-lab-registry.tsx",
);
const source = fs.readFileSync(registryPath, "utf8");
const authorRegistryStart = source.indexOf(
  "export const COMPONENT_LAB_REGISTRY",
);
assert.notEqual(authorRegistryStart, -1);
const authorRegistrySource = source.slice(authorRegistryStart);

const EXPECTED_AUTHOR_COMPONENTS = [
  "HeroSection",
  "HeroHeadline",
  "EditorialHeader",
  "EditorialSplit",
  "ThreeColumnSection",
  "StatementBlock",
  "RichParagraph",
  "ImagePanel",
  "BilibiliEmbed",
  "ProjectCoverLink",
  "WorksList",
  "ParameterGrid",
  "ImageSlider",
  "BreakdownHeadline",
  "NextProjectBlock",
  "HomeEndcapSection",
  "ContactFlashlight",
] as const;

test("ComponentLab 只向作者展示精简后的 17 个组件", () => {
  const keyListMatch = source.match(
    /export const COMPONENT_LAB_COMPONENT_KEYS = \[([\s\S]*?)\] as const/,
  );
  assert.ok(keyListMatch);

  const actualKeys = [...keyListMatch[1].matchAll(/"([^"]+)"/g)]
    .map((match) => match[1]);
  assert.deepEqual(actualKeys, EXPECTED_AUTHOR_COMPONENTS);

  for (const hiddenType of [
    "WorksListEntry",
    "MetadataListItem",
    "TextParagraphBlock",
  ]) {
    assert.doesNotMatch(keyListMatch[1], new RegExp(`"${hiddenType}"`));
  }
});

test("ComponentLab 合并组件复用对应的旧设计作用域", () => {
  const expectedDesignScopes = {
    EditorialHeader: ["PortfolioHeroHeader", "LightingCollectionHeader"],
    EditorialSplit: ["ContentCard", "TextSplitLayout"],
    ThreeColumnSection: ["HighDensityInfoBlock", "BreakdownTriptych"],
    ProjectCoverLink: ["ProjectSection", "LightingProjectCard"],
    WorksList: ["WorksList", "WorksListEntry"],
  } as const;

  for (const [component, scopes] of Object.entries(expectedDesignScopes)) {
    const componentStart = authorRegistrySource.indexOf(`  ${component}: {`);
    assert.notEqual(componentStart, -1, component);
    const blockEnd = authorRegistrySource.indexOf("\n  },", componentStart);
    assert.notEqual(blockEnd, -1, component);
    const block = authorRegistrySource.slice(componentStart, blockEnd);

    for (const scope of scopes) {
      assert.match(block, new RegExp(`"${scope}"`), `${component} 缺少 ${scope}`);
    }
  }
});

test("BilibiliEmbed 不创建独立视觉设计作用域", () => {
  const componentStart = authorRegistrySource.indexOf("  BilibiliEmbed: {");
  assert.notEqual(componentStart, -1);
  const blockEnd = authorRegistrySource.indexOf("\n  },", componentStart);
  const block = authorRegistrySource.slice(componentStart, blockEnd);

  assert.match(block, /designKeys: \[\]/);
  assert.match(block, /sections: \[\]/);
});
