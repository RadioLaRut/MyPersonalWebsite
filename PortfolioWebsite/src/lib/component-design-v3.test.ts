import assert from "node:assert/strict";
import test from "node:test";

import {
  createDefaultComponentDesignDocument as createDefaultComponentDesignDocumentV2,
} from "./component-design-v2.ts";
import {
  cloneComponentDesignDocument,
  createDefaultComponentDesignDocument,
  enableComponentDesignDeviceOverride,
  mergeComponentDesignVariantPatch,
  migrateComponentDesignDocumentV2ToV3,
  normalizeComponentDesignDocument,
  parseComponentDesignDocument,
  parseCurrentComponentDesignDocument,
  resolveComponentDesignDeviceLayout,
  resolveComponentDesignRuntimeDocument,
} from "./component-design-v3.ts";

test("V3 仅接受显式 true 锚定标记并保持默认 center/0 未锚定", () => {
  const document = createDefaultComponentDesignDocument();
  const title = document.components.HeroSection.variants.full.desktop
    .nodes.title;
  assert.equal(
    title.positioning.mode === "overlay"
      ? title.positioning.anchored
      : undefined,
    undefined,
  );

  title.positioning = {
    anchor: "center",
    anchored: true,
    mode: "overlay",
    offset: 0,
  };
  assert.ok(parseCurrentComponentDesignDocument(document));
  assert.equal(
    resolveComponentDesignRuntimeDocument(document).components.HeroSection
      .variants.full.nodes.title.positioning?.desktop.mode,
    "overlay",
  );
  assert.equal(
    (
      resolveComponentDesignRuntimeDocument(document).components.HeroSection
        .variants.full.nodes.title.positioning?.desktop as {
          anchored?: true;
        }
    ).anchored,
    true,
  );

  (
    title.positioning as unknown as { anchored: boolean }
  ).anchored = false;
  assert.equal(parseCurrentComponentDesignDocument(document), null);
});

test("V3 runtime 投影保留桌面字体兼容字段并写入三种设备字体", () => {
  const document = createDefaultComponentDesignDocument();
  const variant = document.components.HeroSection.variants.full;
  variant.desktop.nodes.title.typography = {
    preset: "luna-editorial",
    size: "display",
    wrap: "heading",
  };
  variant.tablet.mode = "custom";
  variant.tablet.custom.nodes.title.typography = {
    preset: "gothic-editorial",
    size: "label",
    wrap: "nowrap",
  };
  variant.mobile.mode = "custom";
  variant.mobile.custom.nodes.title.typography = {
    preset: "sans-body",
    size: "title-sm",
    wrap: "prose",
  };

  const title = resolveComponentDesignRuntimeDocument(document)
    .components.HeroSection.variants.full.nodes.title;

  assert.deepEqual(title.typography, variant.desktop.nodes.title.typography);
  assert.deepEqual(title.responsiveTypography, {
    desktop: variant.desktop.nodes.title.typography,
    mobile: variant.mobile.custom.nodes.title.typography,
    tablet: variant.tablet.custom.nodes.title.typography,
  });
});

test("V2 迁移完整保留三端布局并显式标记移动端覆盖", () => {
  const source = createDefaultComponentDesignDocumentV2();
  source.components.HeroSection.variants.full.nodes.title.placement.desktop = {
    span: 8,
    start: 3,
  };
  source.components.HeroSection.variants.full.nodes.title.placement.tablet = {
    span: 10,
    start: 2,
  };
  source.components.HeroSection.variants.full.nodes.title.placement.mobile = {
    span: 12,
    start: 1,
  };
  source.components.HeroSection.variants.full.gaps["eyebrow>title"] = {
    desktop: 32,
    mobile: 16,
    tablet: 24,
  };

  const migrated = migrateComponentDesignDocumentV2ToV3(source);

  assert.equal(migrated.version, 3);
  assert.equal(
    migrated.components.HeroSection.variants.full.tablet.mode,
    "custom",
  );
  assert.equal(
    migrated.components.HeroSection.variants.full.mobile.mode,
    "custom",
  );
  assert.equal(
    migrated.components.HeroSection.variants.full.tablet.customInitialized,
    true,
  );
  assert.equal(
    migrated.components.HeroSection.variants.full.mobile.customInitialized,
    true,
  );
  const runtime = resolveComponentDesignRuntimeDocument(migrated);
  assert.deepEqual(
    runtime.components.HeroSection.variants.full.nodes.title.placement,
    source.components.HeroSection.variants.full.nodes.title.placement,
  );
  assert.deepEqual(
    runtime.components.HeroSection.variants.full.gaps["eyebrow>title"],
    source.components.HeroSection.variants.full.gaps["eyebrow>title"],
  );
  assert.equal(
    runtime.components.HeroSection.variants.full.nodes.title.positioning
      ?.desktop.mode,
    "overlay",
  );
  assert.ok(runtime.components.HeroSection.variants.full.section);
  assert.ok(parseCurrentComponentDesignDocument(migrated));
});

test("V3 linked 使用桌面布局且不会删除已保存的 custom 布局", () => {
  const document = createDefaultComponentDesignDocument();
  const variant = document.components.HeroSection.variants.full;
  assert.equal(variant.tablet.mode, "linked");
  assert.equal(variant.mobile.mode, "linked");
  assert.equal(variant.tablet.customInitialized, false);
  assert.equal(variant.mobile.customInitialized, false);
  variant.desktop.nodes.title.placement = { span: 8, start: 3 };
  variant.tablet.custom.nodes.title.placement = { span: 10, start: 2 };
  variant.tablet.mode = "linked";

  assert.deepEqual(
    resolveComponentDesignDeviceLayout(variant, "tablet").nodes.title
      .placement,
    { span: 8, start: 3 },
  );
  assert.deepEqual(
    variant.tablet.custom.nodes.title.placement,
    { span: 10, start: 2 },
  );

  variant.tablet.mode = "custom";
  assert.deepEqual(
    resolveComponentDesignDeviceLayout(variant, "tablet").nodes.title
      .placement,
    { span: 10, start: 2 },
  );
});

test("首次启用设备覆盖复制当前桌面布局，恢复跟随后再次启用保留旧覆盖", () => {
  const document = createDefaultComponentDesignDocument();
  const original = document.components.HeroSection.variants.full;
  original.desktop.nodes.title.placement = { span: 7, start: 4 };

  const firstEnabled = enableComponentDesignDeviceOverride(
    original,
    "tablet",
  );
  assert.equal(firstEnabled.tablet.mode, "custom");
  assert.equal(firstEnabled.tablet.customInitialized, true);
  assert.deepEqual(
    firstEnabled.tablet.custom.nodes.title.placement,
    { span: 7, start: 4 },
  );

  firstEnabled.tablet.custom.nodes.title.placement = {
    span: 9,
    start: 2,
  };
  firstEnabled.tablet.mode = "linked";
  firstEnabled.desktop.nodes.title.placement = { span: 6, start: 5 };

  const enabledAgain = enableComponentDesignDeviceOverride(
    firstEnabled,
    "tablet",
  );
  assert.deepEqual(
    enabledAgain.tablet.custom.nodes.title.placement,
    { span: 9, start: 2 },
  );
});

test("V3 规范化、严格解析和克隆不会共享可变引用", () => {
  const document = createDefaultComponentDesignDocument();
  const clone = cloneComponentDesignDocument(document);
  clone.components.RichParagraph.variants.default.sampleText.body =
    "Lab 样例正文";

  assert.equal(
    document.components.RichParagraph.variants.default.sampleText.body,
    undefined,
  );
  assert.deepEqual(
    parseCurrentComponentDesignDocument(clone),
    normalizeComponentDesignDocument(clone),
  );
  assert.equal(
    parseComponentDesignDocument(createDefaultComponentDesignDocumentV2())
      ?.version,
    3,
  );
});

test("V3 严格解析拒绝非法纵向偏移、图片框和样例文字", () => {
  const invalidOffset = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  const title = invalidOffset.components.HeroSection.variants.full.desktop
    .nodes.title;
  title.positioning = {
    anchor: "center",
    mode: "overlay",
    offset: 7,
  };
  assert.equal(parseCurrentComponentDesignDocument(invalidOffset), null);

  const invalidMediaFrame = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  invalidMediaFrame.components.HeroSection.variants.full.desktop.nodes.media
    .mediaFrame = "portrait";
  assert.equal(parseCurrentComponentDesignDocument(invalidMediaFrame), null);

  const invalidText = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  ) as unknown as {
    components: {
      RichParagraph: {
        variants: {
          default: {
            sampleText: Record<string, unknown>;
          };
        };
      };
    };
  };
  invalidText.components.RichParagraph.variants.default.sampleText.body = [
    "合法",
    7,
  ];
  assert.equal(parseCurrentComponentDesignDocument(invalidText), null);
});

test("V3 严格解析以 manifest 固定 bleed、定位模式和节点类型能力", () => {
  const invalidFixedBleed = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  invalidFixedBleed.components.HeroSection.variants.full.desktop.nodes.media
    .bleed = "none";
  assert.equal(parseCurrentComponentDesignDocument(invalidFixedBleed), null);

  const invalidFixedPositioning = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  invalidFixedPositioning.components.HeroSection.variants.full.desktop.nodes
    .media.positioning = {
      anchor: "top",
      anchored: true,
      mode: "overlay",
      offset: 8,
    };
  assert.equal(
    parseCurrentComponentDesignDocument(invalidFixedPositioning),
    null,
  );

  const invalidViewportPlacement = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  invalidViewportPlacement.components.HeroSection.variants.full.desktop.nodes
    .media.placement = { span: 11, start: 2 };
  assert.equal(
    parseCurrentComponentDesignDocument(invalidViewportPlacement),
    null,
  );

  const invalidPositioningMode = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  invalidPositioningMode.components.HeroSection.variants.full.desktop.nodes
    .title.positioning = {
      gapBefore: 0,
      mode: "flow",
      order: 0,
    };
  assert.equal(
    parseCurrentComponentDesignDocument(invalidPositioningMode),
    null,
  );

  const invalidTextCapability = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  invalidTextCapability.components.HeroSection.variants.full.desktop.nodes.title
    .mediaFrame = "square";
  assert.equal(
    parseCurrentComponentDesignDocument(invalidTextCapability),
    null,
  );

  const invalidNormalMediaBleed = cloneComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );
  invalidNormalMediaBleed.components.ImagePanel.variants.content.desktop.nodes
    .media.bleed = "viewport";
  assert.equal(
    parseCurrentComponentDesignDocument(invalidNormalMediaBleed),
    null,
  );
});

test("variantPatch 深度合并样例文字和设备布局且拒绝未知字段", () => {
  const document = createDefaultComponentDesignDocument();
  const patched = mergeComponentDesignVariantPatch(
    document,
    "HeroSection",
    "full",
    {
      sampleText: {
        title: "新的样例标题",
      },
      tablet: {
        mode: "linked",
      },
    },
  );

  assert.ok(patched);
  assert.equal(
    patched.components.HeroSection.variants.full.sampleText.title,
    "新的样例标题",
  );
  assert.equal(
    patched.components.HeroSection.variants.full.tablet.mode,
    "linked",
  );
  assert.deepEqual(
    patched.components.HeroSection.variants.full.tablet.custom,
    document.components.HeroSection.variants.full.tablet.custom,
  );

  assert.equal(
    mergeComponentDesignVariantPatch(
      document,
      "HeroSection",
      "full",
      { desktop: { nodes: { title: { unknownLayoutField: true } } } },
    ),
    null,
  );
  assert.equal(
    mergeComponentDesignVariantPatch(
      document,
      "HeroSection",
      "missing",
      { sampleText: { title: "不会写入" } },
    ),
    null,
  );
});

test("variantPatch 不能绕过 manifest 能力且保留合法定位编辑", () => {
  const document = createDefaultComponentDesignDocument();

  assert.equal(
    mergeComponentDesignVariantPatch(
      document,
      "HeroSection",
      "full",
      { desktop: { nodes: { media: { bleed: "none" } } } },
    ),
    null,
  );
  assert.equal(
    mergeComponentDesignVariantPatch(
      document,
      "HeroSection",
      "full",
      {
        desktop: {
          nodes: {
            media: {
              positioning: {
                anchor: "top",
                anchored: true,
                mode: "overlay",
                offset: 8,
              },
            },
          },
        },
      },
    ),
    null,
  );
  assert.equal(
    mergeComponentDesignVariantPatch(
      document,
      "HeroSection",
      "full",
      {
        desktop: {
          nodes: {
            title: {
              positioning: {
                gapBefore: 0,
                mode: "flow",
                order: 0,
              },
            },
          },
        },
      },
    ),
    null,
  );
  assert.equal(
    mergeComponentDesignVariantPatch(
      document,
      "HeroSection",
      "full",
      { desktop: { nodes: { title: { mediaFrame: "square" } } } },
    ),
    null,
  );
  assert.equal(
    mergeComponentDesignVariantPatch(
      document,
      "ImagePanel",
      "content",
      { desktop: { nodes: { media: { bleed: "viewport" } } } },
    ),
    null,
  );

  const validOverlay = mergeComponentDesignVariantPatch(
    document,
    "HeroSection",
    "full",
    {
      desktop: {
        nodes: {
          title: {
            positioning: {
              anchor: "top",
              anchored: true,
              mode: "overlay",
              offset: 8,
            },
          },
        },
      },
    },
  );
  assert.ok(validOverlay);

  const validFlow = mergeComponentDesignVariantPatch(
    document,
    "RichParagraph",
    "default",
    {
      desktop: {
        nodes: {
          body: {
            positioning: {
              gapBefore: 16,
              mode: "flow",
              order: 2,
            },
          },
        },
      },
    },
  );
  assert.ok(validFlow);
});
