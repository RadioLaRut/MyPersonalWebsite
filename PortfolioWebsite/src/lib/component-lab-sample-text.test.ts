import assert from "node:assert/strict";
import test from "node:test";

import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  COMPONENT_DESIGN_MANIFEST,
} from "./component-design-manifest.ts";
import {
  COMPONENT_LAB_VIRTUAL_TEXT_PROP,
  ComponentLabSampleTextError,
  applyVariantSampleText,
  createVariantSampleNode,
  createVariantSamplePlaceholders,
  extractVariantSampleText,
} from "./component-lab-sample-text.ts";
import {
  ComponentLabPresetError,
  createComponentLabInstanceCatalog,
  parseComponentLabPresetDocument,
  readComponentLabPresetDocument,
} from "./component-lab-presets.ts";
import { contentRepository } from "./content-repository.ts";
import { isPlainRecord } from "./json-utils.ts";

function collectProtectedContent(
  value: unknown,
  path = "$",
): Record<string, unknown> {
  if (Array.isArray(value)) {
    return Object.assign(
      {},
      ...value.map((entry, index) => collectProtectedContent(entry, `${path}[${index}]`)),
    );
  }
  if (!isPlainRecord(value)) return {};

  return Object.assign(
    {},
    ...Object.entries(value).map(([key, entry]) => {
      const entryPath = `${path}.${key}`;
      const protectedKey = (
        key === "source" ||
        /(?:fitmode|focal[xy]|href|image|link|preset|src)$/i.test(key)
      );
      return {
        ...(protectedKey ? { [entryPath]: structuredClone(entry) } : {}),
        ...collectProtectedContent(entry, entryPath),
      };
    }),
  );
}

test("manifest 的 17 个组件和 29 个版式都声明完整、可显示的元素语义", () => {
  assert.deepEqual(
    COMPONENT_DESIGN_MANIFEST.map((entry) => entry.component),
    [...COMPONENT_DESIGN_AUTHOR_COMPONENTS],
  );
  assert.equal(
    COMPONENT_DESIGN_MANIFEST.flatMap((entry) => entry.variants).length,
    29,
  );

  for (const entry of COMPONENT_DESIGN_MANIFEST) {
    for (const variant of entry.variants) {
      const groupLabels = new Map<string, string>();
      assert.equal(
        new Set(variant.nodes.map((node) => node.id)).size,
        variant.nodes.length,
        `${entry.component}/${variant.id} 的 roleId 必须唯一`,
      );
      for (const node of variant.nodes) {
        assert.match(node.label, /[\u3400-\u9fff]/, `${entry.component}/${variant.id}/${node.id}`);
        assert.match(node.groupLabel, /[\u3400-\u9fff]/, `${entry.component}/${variant.id}/${node.id}`);
        assert.ok(["background", "content", "decoration"].includes(node.layer));
        assert.ok(["fixed", "flow", "overlay"].includes(node.positioning));
        assert.equal(typeof node.optional, "boolean");
        assert.equal(typeof node.repeated, "boolean");
        assert.ok(node.group.length > 0);
        const existingGroupLabel = groupLabels.get(node.group);
        if (existingGroupLabel) {
          assert.equal(
            node.groupLabel,
            existingGroupLabel,
            `${entry.component}/${variant.id}/${node.group} 的中文分组名必须一致`,
          );
        } else {
          groupLabels.set(node.group, node.groupLabel);
        }
        if (node.kind === "text" || node.kind === "action") {
          assert.ok(node.sampleBinding, `${entry.component}/${variant.id}/${node.id}`);
        }
        if (node.kind === "media") {
          assert.ok(
            node.mediaFrames && node.mediaFrames.length > 0,
            `${entry.component}/${variant.id}/${node.id} 必须声明图片框清单`,
          );
          assert.equal(
            node.bleed === "viewport",
            node.mediaFrames.includes("viewport"),
            `${entry.component}/${variant.id}/${node.id} 的满屏能力必须由 manifest 固定`,
          );
        }
      }
    }
  }
});

test("每个版式 preset 都能构造独立 Lab 样例并提取全部文字角色", async () => {
  const [pages, presets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);
  const catalog = createComponentLabInstanceCatalog(pages, presets);

  for (const entry of COMPONENT_DESIGN_MANIFEST) {
    const catalogEntry = catalog.components[entry.component];
    assert.deepEqual(
      Object.keys(catalogEntry.variantSamples),
      entry.variants.map((variant) => variant.id),
      entry.component,
    );
    for (const variant of entry.variants) {
      const node = createVariantSampleNode(catalogEntry, variant.id);
      assert.deepEqual(
        collectProtectedContent(node),
        collectProtectedContent(catalogEntry.stressSample.node),
        `${entry.component}/${variant.id} 不能替换媒体或链接`,
      );
      const sampleText = extractVariantSampleText(entry.component, variant.id, node);
      const expectedRoles = variant.nodes
        .filter((candidate) => candidate.kind === "text" || candidate.kind === "action")
        .map((candidate) => candidate.id);
      assert.deepEqual(Object.keys(sampleText), expectedRoles);
      for (const descriptor of variant.nodes) {
        if (!descriptor.sampleBinding) continue;
        assert.equal(
          Array.isArray(sampleText[descriptor.id]),
          descriptor.sampleBinding.kind === "repeated",
          `${entry.component}/${variant.id}/${descriptor.id}`,
        );
      }
    }
  }
});

test("修改样例文字不会改变图片、视频、链接、裁切或图片预设", async () => {
  const [pages, presets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);
  const catalog = createComponentLabInstanceCatalog(pages, presets);
  const source = createVariantSampleNode(
    catalog.components.HeroHeadline,
    "default",
  );
  const protectedBefore = collectProtectedContent(source);
  const updated = applyVariantSampleText(
    "HeroHeadline",
    "default",
    source,
    {
      eyebrow: "新眉题",
      navLink: "新的按钮文字",
      subtitle: "新的副标题",
      title: "新的标题",
    },
  );

  assert.equal(updated.props.title, "新的标题");
  assert.equal(updated.props.navLinkLabel, "新的按钮文字");
  assert.deepEqual(collectProtectedContent(updated), protectedBefore);
  assert.notEqual(updated, source);
  assert.notEqual(updated.props, source.props);
});

test("重复条目的文字按出现位置独立修改，正式结构为空时转为 Lab-only 数据", async () => {
  const [pages, presets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);
  const catalog = createComponentLabInstanceCatalog(pages, presets);
  const source = createVariantSampleNode(catalog.components.WorksList, "default");
  const extracted = extractVariantSampleText("WorksList", "default", source);
  const titles = extracted["item.title"];
  assert.ok(Array.isArray(titles));
  assert.ok(titles.length > 1);

  const nextTitles = titles.map((_, index) => `独立标题 ${index + 1}`);
  const updated = applyVariantSampleText("WorksList", "default", source, {
    "item.title": nextTitles,
  });
  assert.deepEqual(
    extractVariantSampleText("WorksList", "default", updated)["item.title"],
    nextTitles,
  );

  const emptyEditorialSplit = structuredClone(
    catalog.components.EditorialSplit.variantSamples.stack,
  );
  emptyEditorialSplit.props.paragraphs = [];
  const virtual = applyVariantSampleText(
    "EditorialSplit",
    "stack",
    emptyEditorialSplit,
    { "body.item": ["仅用于 Lab 的空段落占位"] },
  );
  assert.deepEqual(virtual.props.paragraphs, []);
  assert.deepEqual(
    (virtual.props[COMPONENT_LAB_VIRTUAL_TEXT_PROP] as Record<string, unknown>)["body.item"],
    ["仅用于 Lab 的空段落占位"],
  );
  assert.deepEqual(
    extractVariantSampleText("EditorialSplit", "stack", virtual)["body.item"],
    ["仅用于 Lab 的空段落占位"],
  );
});

test("可选空文字的占位根据版式 fallback 与当前覆盖共同计算", async () => {
  const [pages, presets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);
  const catalog = createComponentLabInstanceCatalog(pages, presets);
  const source = createVariantSampleNode(catalog.components.HeroHeadline, "default");
  source.props.navLinkLabel = "";

  const placeholders = createVariantSamplePlaceholders(
    "HeroHeadline",
    "default",
    source,
  );
  assert.ok(placeholders.some((placeholder) => placeholder.roleId === "navLink"));

  const overridden = createVariantSamplePlaceholders(
    "HeroHeadline",
    "default",
    source,
    { navLink: "观看视频" },
  );
  assert.equal(
    overridden.some((placeholder) => placeholder.roleId === "navLink"),
    false,
  );
});

test("旧 v2 preset 可迁移补齐版式样例，新 preset 拒绝媒体覆盖与缺失版式", async () => {
  const source = structuredClone(await readComponentLabPresetDocument());
  const legacy = structuredClone(source) as unknown as {
    components: Record<string, Record<string, unknown>>;
    version: number;
  };
  delete legacy.components.HeroSection.variantSamples;
  const migrated = parseComponentLabPresetDocument(legacy);
  assert.deepEqual(
    Object.keys(migrated.components.HeroSection.variantSamples),
    ["poster", "full"],
  );

  const mediaOverride = structuredClone(source) as unknown as {
    components: Record<string, {
      variantSamples: Record<string, { props: Record<string, unknown> }>;
    }>;
  };
  const heroHeadlineStress = source.components.HeroHeadline.stressSample;
  assert.ok(heroHeadlineStress.kind === "derived");
  const originalImageSrc = heroHeadlineStress.props.heroImage;
  assert.ok(typeof originalImageSrc === "string");
  assert.match(originalImageSrc, /^\/(?:images|assets\/images)\//);
  mediaOverride.components.HeroSection.variantSamples.poster.props.heroImage =
    `${originalImageSrc}?component-lab-test=forbidden`;
  assert.throws(
    () => parseComponentLabPresetDocument(mediaOverride),
    (error) => (
      error instanceof ComponentLabPresetError &&
      error.message.includes("不允许覆盖媒体、链接或节点身份")
    ),
  );

  const missingVariant = structuredClone(source) as unknown as {
    components: Record<string, {
      variantSamples: Record<string, { props: Record<string, unknown> }>;
    }>;
  };
  delete missingVariant.components.HeroSection.variantSamples.full;
  assert.throws(
    () => parseComponentLabPresetDocument(missingVariant),
    (error) => (
      error instanceof ComponentLabPresetError &&
      error.message.includes("版式清单不一致")
    ),
  );
});

test("样例文字 helper 拒绝错误版式、媒体角色和标量类型", async () => {
  const [pages, presets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);
  const catalog = createComponentLabInstanceCatalog(pages, presets);
  const source = createVariantSampleNode(catalog.components.HeroHeadline, "default");

  assert.throws(
    () => applyVariantSampleText("HeroHeadline", "missing", source, {}),
    (error) => (
      error instanceof ComponentLabSampleTextError &&
      error.message.includes("不存在版式")
    ),
  );
  assert.throws(
    () => applyVariantSampleText(
      "HeroHeadline",
      "default",
      source,
      { media: "不允许修改图片" },
    ),
    (error) => (
      error instanceof ComponentLabSampleTextError &&
      error.message.includes("不允许修改 media")
    ),
  );
  assert.throws(
    () => applyVariantSampleText(
      "HeroHeadline",
      "default",
      source,
      { title: ["错误类型"] },
    ),
    (error) => (
      error instanceof ComponentLabSampleTextError &&
      error.message.includes("必须是单段文字")
    ),
  );
});
