import assert from "node:assert/strict";
import test from "node:test";

import {
  COMPONENT_DESIGN_OPTICAL_PULL_TOKENS,
  COMPONENT_DESIGN_RHYTHM_TOKENS,
  COMPONENT_DESIGN_SECTION_PROFILE_VALUES,
  cloneComponentDesignDocument,
  type ComponentGridPlacement,
  createDefaultComponentDesignDocument,
  isGridPlacement,
  normalizeComponentDesignDocument,
  parseComponentDesignDocument,
  parseCurrentComponentDesignDocument,
  resolveComponentDesignVariant,
} from "./component-design-v2.ts";
import {
  createDefaultComponentDesignDocument as createLegacyComponentDesignDocument,
} from "./component-design-schema.ts";
import { isTypographyFontLabSizeSupported } from "./typography-tokens.ts";

test("V2 只接受页面 12 格内的整数 start/span，且不保存结束格", () => {
  assert.equal(isGridPlacement({ start: 1, span: 12 }), true);
  assert.equal(isGridPlacement({ start: 12, span: 1 }), true);
  assert.equal(isGridPlacement({ start: 0, span: 1 }), false);
  assert.equal(isGridPlacement({ start: 4, span: 10 }), false);
  assert.equal(isGridPlacement({ start: 2.5, span: 4 }), false);

  const invalid = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  const placement =
    invalid.components.HeroSection.variants.poster.nodes.title.placement
      .desktop as ComponentGridPlacement & { end?: number };
  placement.end = 8;
  assert.equal(parseCurrentComponentDesignDocument(invalid), null);

  const normalized = normalizeComponentDesignDocument(invalid);
  assert.deepEqual(
    normalized.components.HeroSection.variants.poster.nodes.title.placement
      .desktop,
    createDefaultComponentDesignDocument().components.HeroSection.variants
      .poster.nodes.title.placement.desktop,
  );
});

test("延伸至视口的媒体仍固定锚定页面第 1–12 格", () => {
  const document = createDefaultComponentDesignDocument();
  document.components.HeroSection.variants.poster.nodes.media.placement.desktop = {
    span: 4,
    start: 5,
  };

  const normalized = normalizeComponentDesignDocument(document);

  assert.deepEqual(
    normalized.components.HeroSection.variants.poster.nodes.media.placement,
    {
      desktop: { span: 12, start: 1 },
      mobile: { span: 12, start: 1 },
      tablet: { span: 12, start: 1 },
    },
  );
  assert.equal(parseCurrentComponentDesignDocument(document), null);
});

test("V2 节奏、光学上提和 Section 档位均为固定枚举", () => {
  assert.deepEqual(COMPONENT_DESIGN_RHYTHM_TOKENS, [
    0,
    8,
    16,
    24,
    32,
    48,
    64,
  ]);
  assert.deepEqual(COMPONENT_DESIGN_OPTICAL_PULL_TOKENS, [0, 4, 8, 12]);
  assert.deepEqual(COMPONENT_DESIGN_SECTION_PROFILE_VALUES.normal.desktop, {
    bottom: 96,
    top: 96,
  });

  const invalid = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  invalid.components.HeroSection.variants.full.gaps[
    "title>subtitle"
  ].desktop = 12 as never;
  assert.equal(parseCurrentComponentDesignDocument(invalid), null);
  assert.equal(
    normalizeComponentDesignDocument(invalid).components.HeroSection.variants
      .full.gaps["title>subtitle"].desktop,
    createDefaultComponentDesignDocument().components.HeroSection.variants.full
      .gaps["title>subtitle"].desktop,
  );
});

test("V2 字体只能使用 FontLab 当前可配置的 preset/size 组合", () => {
  const invalid = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  const typography =
    invalid.components.HeroSection.variants.poster.nodes.title.typography!;
  typography.preset = "classical-display";
  typography.size = "hero";

  assert.equal(
    isTypographyFontLabSizeSupported(typography.preset, typography.size),
    false,
  );
  assert.equal(parseCurrentComponentDesignDocument(invalid), null);

  const normalized = normalizeComponentDesignDocument(invalid);
  const normalizedTypography =
    normalized.components.HeroSection.variants.poster.nodes.title.typography!;
  assert.equal(normalizedTypography.preset, "classical-display");
  assert.equal(normalizedTypography.size, "menu");
  assert.equal(
    isTypographyFontLabSizeSupported(
      normalizedTypography.preset,
      normalizedTypography.size,
    ),
    true,
  );
});

test("V1 响应式 base/md/lg 无损迁移为 mobile/tablet/desktop", () => {
  const legacy = createLegacyComponentDesignDocument();
  legacy.components.HeroSection.contentBounds = {
    base: { leftCol: 1, rightCol: 12 },
    md: { leftCol: 3, rightCol: 10 },
    lg: { leftCol: 8, rightCol: 12 },
  };
  legacy.components.ProjectSection.titleUnderlineOpticalPull = "12";

  const migrated = parseComponentDesignDocument(legacy);
  assert.ok(migrated);
  assert.deepEqual(
    migrated.components.HeroSection.variants.full.nodes.title.placement,
    {
      desktop: { span: 5, start: 8 },
      mobile: { span: 12, start: 1 },
      tablet: { span: 8, start: 3 },
    },
  );
  assert.equal(
    migrated.components.ProjectCoverLink.variants["immersive-left"].nodes.title
      .opticalPull,
    12,
  );
  assert.ok(parseCurrentComponentDesignDocument(migrated));
});

test("结构变体解析只产生 manifest 中的固定变体", () => {
  assert.equal(
    resolveComponentDesignVariant("HeroSection", { variant: "poster" }),
    "poster",
  );
  assert.equal(
    resolveComponentDesignVariant("HeroSection", {
      description: "有说明",
    }),
    "full",
  );
  assert.equal(
    resolveComponentDesignVariant("ProjectCoverLink", {
      variant: "immersive-right",
    }),
    "immersive-right",
  );
  assert.equal(
    resolveComponentDesignVariant("ProjectCoverLink", {
      align: "right",
      variant: "immersive",
    }),
    "immersive-right",
  );
  assert.equal(
    resolveComponentDesignVariant("ThreeColumnSection", {
      variant: "evidence",
    }),
    "phase",
  );
});

test("可选节点收拢和重复模板都有显式共享 gap 规则", () => {
  const document = createDefaultComponentDesignDocument();
  const hero = document.components.HeroSection.variants.full;
  assert.ok(hero.gaps["title>primaryCta"]);
  assert.ok(hero.gaps["subtitle>primaryCta"]);
  assert.ok(hero.gaps["description>primaryCta"]);
  assert.ok(hero.gaps["title>secondaryCta"]);
  assert.ok(hero.gaps["primaryCta>secondaryCta"]);

  const works = document.components.WorksList.variants.default;
  assert.ok(works.gaps["item.title>item.title"]);
  const parameters = document.components.ParameterGrid.variants.default;
  assert.ok(parameters.gaps["item.description>item.description"]);
});
