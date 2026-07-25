import assert from "node:assert/strict";
import test from "node:test";

import { PAGE_DOCUMENT_VERSION, type PageDocument } from "./page-document-contract.ts";
import { createPageMetadata, SITE_ROBOTS_POLICY } from "./page-metadata.ts";

function createDocument(noIndex: boolean): PageDocument {
  return {
    content: [],
    root: {
      props: {
        description: "页面摘要",
        image: "/images/covers/2026/ShotForCrewWithoutWord.0004.webp",
        noIndex,
        title: "页面标题",
      },
    },
    version: PAGE_DOCUMENT_VERSION,
    zones: {},
  };
}

test("页面元数据始终执行全站不可索引策略", () => {
  for (const legacyNoIndexValue of [false, true]) {
    const metadata = createPageMetadata(createDocument(legacyNoIndexValue));

    assert.deepEqual(metadata.robots, SITE_ROBOTS_POLICY);
    assert.equal(metadata.title, "页面标题");
    assert.equal(metadata.description, "页面摘要");
    assert.deepEqual(metadata.openGraph, {
      description: "页面摘要",
      images: [{ url: "/images/covers/2026/ShotForCrewWithoutWord.0004.webp" }],
      title: "页面标题",
    });
  }
});
