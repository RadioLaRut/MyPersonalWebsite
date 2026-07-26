import assert from "node:assert/strict";
import test from "node:test";

import type { Data } from "@puckeditor/core";

import { PUCK_COMPONENT_TYPES } from "../component-manifest.ts";
import {
  EDITOR_COMPONENT_METADATA,
  searchEditorComponents,
} from "./component-metadata.ts";
import {
  buildEditorOutline,
  buildPageSummaryTree,
  EDITOR_DISPLAY_NAME_MAX_LENGTH,
  flattenPageSummaryTree,
  formatEditorTechnicalName,
  getAllowedComponentsForZone,
  getEditorFieldGroup,
  normalizeEditorDisplayName,
  renameEditorNode,
  ROOT_INSERTION_ZONE,
  searchPageSummaries,
  stripEditorMetadata,
} from "./editor-data.ts";

function createEditorData(): Data {
  return {
    content: [
      {
        props: {
          editorDisplayName: "项目索引",
          entries: [
            {
              props: {
                category: "Lighting",
                desc: "Description",
                href: "/works/example",
                id: "entry-1",
                imageSrc: "/images/covers/2026/作品集封面2026.webp",
                number: "01",
                title: "Example",
              },
              type: "WorksListEntry",
            },
          ],
          heading: "Works",
          id: "works-list-1",
          indexSummary: "Summary",
        },
        type: "WorksList",
      },
      {
        props: {
          content: "Paragraph",
          editorDisplayName: "重复名称",
          id: "paragraph-1",
        },
        type: "RichParagraph",
      },
    ],
    root: { props: { title: "Test" } },
    zones: {},
  } as Data;
}

test("编辑器元数据完整覆盖当前组件清单并提供中文名与说明", () => {
  assert.equal(EDITOR_COMPONENT_METADATA.length, PUCK_COMPONENT_TYPES.length);
  assert.deepEqual(
    EDITOR_COMPONENT_METADATA.map((entry) => entry.type),
    [...PUCK_COMPONENT_TYPES],
  );
  for (const entry of EDITOR_COMPONENT_METADATA) {
    assert.ok(entry.label.trim().length > 0, entry.type);
    assert.ok(entry.description.trim().length > 0, entry.type);
  }
  assert.equal(
    EDITOR_COMPONENT_METADATA.find((entry) => entry.type === "HeroSection")?.label,
    "首页主视觉",
  );
  assert.equal(
    EDITOR_COMPONENT_METADATA.find((entry) => (
      entry.type === "TextParagraphBlock"
    ))?.label,
    "文本段落项",
  );
});

test("组件搜索匹配中文名、英文类型、用途与路径别名", () => {
  assert.deepEqual(
    searchEditorComponents("首页主视觉").map((entry) => entry.type),
    ["HeroSection"],
  );
  assert.deepEqual(
    searchEditorComponents("ImageSlider").map((entry) => entry.type),
    ["ImageSlider"],
  );
  assert.ok(searchEditorComponents("阶段").some((entry) => (
    entry.type === "ThreeColumnSection"
  )));
  assert.ok(searchEditorComponents("paragraphs").some((entry) => (
    entry.type === "EditorialSplit"
  )));
});

test("大纲递归展示 Slot，根区域与 Slot 使用各自兼容清单", () => {
  const data = createEditorData();
  const outline = buildEditorOutline(data);
  const root = outline[0];
  const worksList = root.nodes[0];

  assert.equal(root.zone, ROOT_INSERTION_ZONE);
  assert.equal(worksList.displayName, "项目索引");
  assert.equal(worksList.children[0].zone, "works-list-1:entries");
  assert.equal(worksList.children[0].nodes[0].type, "WorksListEntry");

  const rootAllowed = getAllowedComponentsForZone(ROOT_INSERTION_ZONE, data);
  assert.equal(rootAllowed.has("HeroSection"), true);
  assert.equal(rootAllowed.has("WorksListEntry"), false);
  assert.equal(rootAllowed.has("MetadataListItem"), false);
  assert.equal(rootAllowed.has("TextParagraphBlock"), false);

  assert.deepEqual(
    [...getAllowedComponentsForZone("works-list-1:entries", data)],
    ["WorksListEntry"],
  );
  assert.equal(
    getAllowedComponentsForZone("paragraph-1:entries", data).size,
    0,
  );
});

test("DisplayName 支持重复、清空恢复默认、80 字符上限与无变化复用", () => {
  const data = createEditorData();
  const renamed = renameEditorNode(data, "entry-1", "  重复名称  ");
  const renamedEntry = (
    renamed.content[0].props.entries as Array<{ props: Record<string, unknown> }>
  )[0];
  assert.equal(renamedEntry.props.editorDisplayName, "重复名称");

  const sameRename = renameEditorNode(renamed, "entry-1", "重复名称");
  assert.equal(sameRename, renamed);

  const cleared = renameEditorNode(renamed, "entry-1", "   ");
  const clearedEntry = (
    cleared.content[0].props.entries as Array<{ props: Record<string, unknown> }>
  )[0];
  assert.equal("editorDisplayName" in clearedEntry.props, false);
  assert.equal(
    buildEditorOutline(cleared)[0].nodes[0].children[0].nodes[0].displayName,
    "作品列表项",
  );

  const longName = "名".repeat(EDITOR_DISPLAY_NAME_MAX_LENGTH + 10);
  assert.equal(
    normalizeEditorDisplayName(longName)?.length,
    EDITOR_DISPLAY_NAME_MAX_LENGTH,
  );
});

test("编辑器元数据会从根节点、Slot 和普通对象中递归剥离", () => {
  const stripped = stripEditorMetadata({
    editorDisplayName: "root",
    nested: [
      {
        props: {
          editorDisplayName: "nested",
          id: "nested-1",
        },
      },
    ],
  });

  assert.deepEqual(stripped, {
    nested: [{ props: { id: "nested-1" } }],
  });
});

test("页面搜索同时匹配中文标题、英文 slug 与公开路径", () => {
  const pages = [
    { publicPath: "/", slug: "index", title: "首页" },
    { publicPath: "/works/insight", slug: "works/insight", title: "舆情监管" },
  ];

  assert.deepEqual(searchPageSummaries(pages, "舆情"), [pages[1]]);
  assert.deepEqual(searchPageSummaries(pages, "INSIGHT"), [pages[1]]);
  assert.deepEqual(searchPageSummaries(pages, "/works"), [pages[1]]);
});

test("页面选择器按 URL 构建树，并在搜索时保留祖先层级", () => {
  const pages = [
    { publicPath: "/about", slug: "about", title: "About" },
    { publicPath: "/", slug: "index", title: "Home" },
    { publicPath: "/works", slug: "works", title: "Works" },
    {
      publicPath: "/works/epic-stage",
      slug: "works/epic-stage",
      title: "舞台灯光叙事概念设计",
    },
    {
      publicPath: "/works/lighting-portfolio",
      slug: "works/lighting-portfolio",
      title: "Lighting Portfolio",
    },
    {
      publicPath: "/works/lighting-portfolio/collection-1",
      slug: "works/lighting-portfolio/collection-1",
      title: "Collection One",
    },
  ];

  const tree = buildPageSummaryTree(pages);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].publicPath, "/");
  assert.deepEqual(
    tree[0].children.map((node) => node.publicPath),
    ["/about", "/works"],
  );
  assert.deepEqual(
    tree[0].children[1].children.map((node) => node.publicPath),
    ["/works/epic-stage", "/works/lighting-portfolio"],
  );
  assert.equal(
    tree[0].children[1].children[1].children[0].publicPath,
    "/works/lighting-portfolio/collection-1",
  );
  assert.deepEqual(
    flattenPageSummaryTree(tree).map((page) => page.publicPath),
    [
      "/",
      "/about",
      "/works",
      "/works/epic-stage",
      "/works/lighting-portfolio",
      "/works/lighting-portfolio/collection-1",
    ],
  );

  const filteredTree = buildPageSummaryTree(pages, "collection one");
  assert.deepEqual(
    flattenPageSummaryTree(filteredTree).map((page) => page.publicPath),
    [
      "/",
      "/works",
      "/works/lighting-portfolio",
      "/works/lighting-portfolio/collection-1",
    ],
  );
});

test("页面树会为缺失的中间路径创建不可选分组", () => {
  const tree = buildPageSummaryTree([
    {
      publicPath: "/journal/2026/launch",
      slug: "journal/2026/launch",
      title: "Launch",
    },
  ]);

  assert.equal(tree[0].publicPath, "/journal");
  assert.equal(tree[0].page, null);
  assert.equal(tree[0].title, "Journal");
  assert.equal(tree[0].children[0].publicPath, "/journal/2026");
  assert.equal(
    tree[0].children[0].children[0].page?.publicPath,
    "/journal/2026/launch",
  );
});

test("属性字段按内容、媒体、链接、布局与高级设置分组", () => {
  assert.equal(getEditorFieldGroup("_g_text"), null);
  assert.equal(getEditorFieldGroup("__group_Text"), null);
  assert.equal(getEditorFieldGroup("title"), "content");
  assert.equal(getEditorFieldGroup("align"), "content");
  assert.equal(getEditorFieldGroup("mobileImageFocalX"), "media");
  assert.equal(getEditorFieldGroup("primaryCtaHref"), "link");
  assert.equal(getEditorFieldGroup("layoutVariant"), "layout");
  assert.equal(getEditorFieldGroup("darkTextColor"), "advanced");
  assert.equal(getEditorFieldGroup("noIndex"), "advanced");
});

test("编辑器技术名称拆分单词并统一首字母大写", () => {
  assert.equal(
    formatEditorTechnicalName("descriptionAlign"),
    "Description Align",
  );
  assert.equal(
    formatEditorTechnicalName("mobileImageFocalX"),
    "Mobile Image Focal X",
  );
  assert.equal(formatEditorTechnicalName("HeroSection"), "Hero Section");
  assert.equal(formatEditorTechnicalName("HTMLContent"), "HTML Content");
});
