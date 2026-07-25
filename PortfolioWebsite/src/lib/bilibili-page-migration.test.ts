import assert from "node:assert/strict";
import test from "node:test";

import {
  BILIBILI_VIDEO_BY_PAGE_SLUG,
  migrateBilibiliPage,
} from "./bilibili-page-migration.ts";
import type { PageDocument } from "./page-document-contract.ts";

function createDocument(navLink: string): PageDocument {
  return {
    content: [
      {
        props: {
          eyebrow: "PROJECT",
          heroImage: "",
          heroImageFitMode: "x",
          heroImagePreset: "ratio-21-9",
          id: "hero",
          navLink,
          navLinkLabel: "观看视频",
          subtitle: "Subtitle",
          subtitleAlign: "left",
          title: "Title",
        },
        type: "HeroHeadline",
      },
    ],
    root: {
      props: {
        description: "",
        image: "",
        noIndex: false,
        title: "测试项目",
      },
    },
    version: 1,
    zones: {},
  };
}

test("六个目标页面各插入一个 B 站组件并移除重复观看按钮", () => {
  for (const [slug, source] of Object.entries(BILIBILI_VIDEO_BY_PAGE_SLUG)) {
    const first = migrateBilibiliPage(createDocument(source), slug);
    assert.equal(first.migrated, true);
    assert.equal(first.document.content.length, 2);
    assert.equal(first.document.content[1].type, "BilibiliEmbed");
    assert.equal(first.document.content[1].props.source, source);
    assert.equal(first.document.content[0].props.navLink, "");
    assert.equal(first.document.content[0].props.navLinkLabel, "");

    const second = migrateBilibiliPage(first.document, slug);
    assert.equal(second.migrated, false);
    assert.equal(
      second.document.content.filter((node) => node.type === "BilibiliEmbed").length,
      1,
    );
  }
});

test("非目标页面及百度网盘链接不受影响", () => {
  const document = createDocument("https://pan.baidu.com/s/example");
  const result = migrateBilibiliPage(document, "works/penguin");
  assert.equal(result.migrated, false);
  assert.equal(result.document.content[0].props.navLink, document.content[0].props.navLink);
  assert.equal(result.document.content.length, 1);
});
