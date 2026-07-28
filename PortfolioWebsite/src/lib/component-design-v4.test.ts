import assert from "node:assert/strict";
import test from "node:test";

import {
  COMPONENT_DESIGN_MANIFEST,
} from "./component-design-manifest.ts";
import {
  createDefaultComponentDesignDocument as createDefaultComponentDesignDocumentV3,
} from "./component-design-v3.ts";
import {
  cloneComponentDesignDocument,
  createDefaultComponentDesignDocument,
  mergeComponentDesignVariantPatch,
  migrateComponentDesignDocumentV3ToV4,
  parseComponentDesignDocument,
  parseCurrentComponentDesignDocument,
  resolveComponentDesignRuntimeDocument,
} from "./component-design-v4.ts";

test("V4 为每个组件版式持久化 manifest 的 canonical composition", () => {
  const document = createDefaultComponentDesignDocument();

  assert.equal(document.version, 4);
  for (const entry of COMPONENT_DESIGN_MANIFEST) {
    for (const variant of entry.variants) {
      assert.deepEqual(
        document.components[entry.component].variants[variant.id].composition,
        variant.composition ?? [],
        `${entry.component}.${variant.id}`,
      );
    }
  }
  assert.ok(parseCurrentComponentDesignDocument(document));
});

test("V3 迁移到 V4 时保留布局、设备覆盖和样例文字", () => {
  const legacy = createDefaultComponentDesignDocumentV3();
  legacy.components.HeroSection.variants.full.sampleText.title =
    "保留的样例标题";
  legacy.components.HeroSection.variants.full.tablet.mode = "custom";
  legacy.components.HeroSection.variants.full.tablet.custom.nodes.title
    .placement = { span: 8, start: 3 };

  const migrated = migrateComponentDesignDocumentV3ToV4(legacy);

  assert.equal(migrated.version, 4);
  assert.equal(
    migrated.components.HeroSection.variants.full.sampleText.title,
    "保留的样例标题",
  );
  assert.deepEqual(
    migrated.components.HeroSection.variants.full.tablet.custom.nodes.title
      .placement,
    { span: 8, start: 3 },
  );
  assert.deepEqual(
    parseComponentDesignDocument(legacy),
    migrated,
  );
});

test("V4 严格解析拒绝缺失或偏离 manifest 的 composition", () => {
  const missing = createDefaultComponentDesignDocument();
  missing.components.WorksList.variants.default.composition = [];

  const changed = createDefaultComponentDesignDocument();
  changed.components.HeroSection.variants.poster.composition[0] = {
    ...changed.components.HeroSection.variants.poster.composition[0],
    members: ["title"],
  };

  assert.equal(parseCurrentComponentDesignDocument(missing), null);
  assert.equal(parseComponentDesignDocument(missing), null);
  assert.equal(parseCurrentComponentDesignDocument(changed), null);
  assert.equal(parseComponentDesignDocument(changed), null);
});

test("版式 patch 不能修改 composition，合法布局修改会保留契约", () => {
  const document = createDefaultComponentDesignDocument();
  const composition = structuredClone(
    document.components.HeroSection.variants.full.composition,
  );

  assert.equal(
    mergeComponentDesignVariantPatch(
      document,
      "HeroSection",
      "full",
      { composition: [] },
    ),
    null,
  );

  const merged = mergeComponentDesignVariantPatch(
    document,
    "HeroSection",
    "full",
    {
      desktop: {
        nodes: {
          title: {
            placement: { span: 8, start: 3 },
          },
        },
      },
    },
  );

  assert.ok(merged);
  assert.deepEqual(
    merged.components.HeroSection.variants.full.composition,
    composition,
  );
  assert.deepEqual(
    merged.components.HeroSection.variants.full.desktop.nodes.title.placement,
    { span: 8, start: 3 },
  );
});

test("公开运行时投影不包含 composition，克隆不会共享可变引用", () => {
  const document = createDefaultComponentDesignDocument();
  const cloned = cloneComponentDesignDocument(document);
  cloned.components.HeroSection.variants.full.composition = [];

  assert.notDeepEqual(
    cloned.components.HeroSection.variants.full.composition,
    document.components.HeroSection.variants.full.composition,
  );

  const runtime = resolveComponentDesignRuntimeDocument(document);
  assert.equal(
    "composition" in runtime.components.HeroSection.variants.full,
    false,
  );
});
