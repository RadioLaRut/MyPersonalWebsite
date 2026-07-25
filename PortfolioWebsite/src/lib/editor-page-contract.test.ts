import assert from "node:assert/strict";
import test from "node:test";

import type { Data } from "@puckeditor/core";

import {
  createBlankPageDocument,
  duplicatePageDocument,
  isCreatePageRequest,
} from "./editor-page-contract.ts";

test("空白页面不带内容和 SEO，并默认禁止收录", () => {
  assert.deepEqual(createBlankPageDocument(), {
    content: [],
    root: {
      props: {
        description: "",
        image: "",
        noIndex: true,
        title: "",
      },
    },
    version: 1,
    zones: {},
  });
});

test("复制页面递归刷新组件 ID，保留 DisplayName 并强制不收录", () => {
  const source = {
    content: [
      {
        props: {
          editorDisplayName: "作品列表",
          entries: [
            {
              props: {
                editorDisplayName: "首个作品",
                id: "entry-old",
              },
              type: "WorksListEntry",
            },
          ],
          id: "list-old",
        },
        type: "WorksList",
      },
    ],
    root: {
      props: {
        description: "Description",
        image: "/images/covers/2026/作品集封面2026.webp",
        noIndex: false,
        title: "作品",
      },
    },
    version: 1,
    zones: {
      "legacy:zone": [
        {
          props: { id: "legacy-old" },
          type: "RichParagraph",
        },
      ],
    },
  } as Data;
  const ids = ["list-new", "entry-new", "legacy-new"];
  const duplicated = duplicatePageDocument(source, () => ids.shift() ?? "extra");

  assert.equal(duplicated.root.props.title, "作品（副本）");
  assert.equal(duplicated.root.props.noIndex, true);
  assert.equal(duplicated.content[0].props.id, "list-new");
  assert.equal(duplicated.content[0].props.editorDisplayName, "作品列表");
  const nested = duplicated.content[0].props.entries as Array<{
    props: Record<string, unknown>;
  }>;
  assert.equal(nested[0].props.id, "entry-new");
  assert.equal(nested[0].props.editorDisplayName, "首个作品");
  assert.ok(duplicated.zones);
  assert.equal(duplicated.zones["legacy:zone"][0].props.id, "legacy-new");
  assert.equal(source.content[0].props.id, "list-old");
});

test("新建页面请求只接受 blank 或带来源的 duplicate", () => {
  assert.equal(isCreatePageRequest({ slug: "about-copy", mode: "blank" }), true);
  assert.equal(isCreatePageRequest({
    slug: "about-copy",
    mode: "duplicate",
    sourceSlug: "about",
  }), true);
  assert.equal(isCreatePageRequest({
    slug: "about-copy",
    mode: "duplicate",
  }), false);
  assert.equal(isCreatePageRequest({
    slug: "about-copy",
    mode: "unknown",
  }), false);
});
