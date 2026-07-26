import assert from "node:assert/strict";
import test from "node:test";

import type { PageDocument } from "./page-document-contract.ts";
import {
  findFirstPublicMedia,
  findPublicMediaPreloadCandidate,
  getMediaLayoutProfile,
} from "./media-layout.ts";

function asDocument(content: PageDocument["content"]): PageDocument {
  return {
    content,
    root: {
      props: {
        description: "",
        image: "",
        noIndex: true,
        title: "Test",
      },
    },
    version: 1,
    zones: {},
  };
}

test("公开媒体选择器只返回页面中的第一个媒体组件", () => {
  const selection = findFirstPublicMedia(asDocument([
    {
      type: "StatementBlock",
      props: { id: "statement", content: "No image" },
    },
    {
      type: "HeroSection",
      props: { id: "hero", imageSrc: "/images/insight/InsightCover.webp" },
    },
    {
      type: "ImagePanel",
      props: { id: "panel", src: "/images/city-2026/001.webp" },
    },
  ]));

  assert.deepEqual(selection, {
    componentId: "hero",
    src: "/images/insight/InsightCover.webp",
  });
});

test("phase 三栏只提示实际渲染的第三栏图片", () => {
  const selection = findFirstPublicMedia(asDocument([
    {
      type: "ThreeColumnSection",
      props: {
        id: "phases",
        variant: "phase",
        col1MediaSrc: "/images/city-2026/002.webp",
        col3MediaSrc: "/images/city-2026/003.webp",
      },
    },
  ]));

  assert.equal(selection?.src, "/images/city-2026/003.webp");
});

test("媒体预加载只考虑首个组件且允许描述符排除隐藏媒体", () => {
  const worksDocument = asDocument([
    {
      type: "WorksList",
      props: {
        id: "works",
        entries: [
          {
            type: "WorksListEntry",
            props: {
              id: "entry",
              imageSrc: "/images/train-station/2Day.webp",
            },
          },
        ],
      },
    },
  ]);
  assert.equal(
    findPublicMediaPreloadCandidate(
      worksDocument,
      (component) => component.type !== "WorksList",
    ),
    null,
  );

  const heroAfterText = asDocument([
    {
      type: "StatementBlock",
      props: { id: "statement", content: "No image" },
    },
    {
      type: "HeroSection",
      props: { id: "hero", imageSrc: "/images/insight/InsightCover.webp" },
    },
  ]);
  assert.equal(
    findPublicMediaPreloadCandidate(heroAfterText, () => true),
    null,
  );
});

test("网格媒体尺寸不会把非全屏图片声明为 100vw", () => {
  assert.equal(getMediaLayoutProfile("full-bleed").sizes, "100vw");
  assert.doesNotMatch(getMediaLayoutProfile("grid-6").sizes, /^100vw$/u);
  assert.doesNotMatch(getMediaLayoutProfile("grid-4").sizes, /^100vw$/u);
});
