import assert from "node:assert/strict";
import test from "node:test";

import type { JsonValue } from "./puck-content.ts";
import { publishPuckPage } from "./puck-publish.ts";
import type { NormalizedPuckSlug } from "./puck-slug.ts";

const normalizedSlug: NormalizedPuckSlug = {
  absoluteJsonPath: "C:/tmp/content/pages/about.json",
  relativeJsonPath: "about.json",
  slugKey: "about",
  slugSegments: ["about"],
};

const pageData = {
  content: [],
} satisfies JsonValue;

test("publishPuckPage still succeeds when slug list refresh fails after write", async () => {
  let writeCompleted = false;

  const result = await publishPuckPage({
    data: pageData,
    listPageSlugs: async () => {
      throw new Error("list failed");
    },
    normalizedSlug,
    writePageData: async (slug, data) => {
      assert.equal(slug, normalizedSlug);
      assert.deepEqual(data, pageData);
      writeCompleted = true;
    },
  });

  assert.equal(writeCompleted, true);
  assert.deepEqual(result, {
    ok: true,
    path: "about.json",
    slug: "about",
  });
});

test("publishPuckPage keeps slug list when refresh succeeds", async () => {
  const result = await publishPuckPage({
    data: pageData,
    listPageSlugs: async () => ["about", "works/penguin"],
    normalizedSlug,
    writePageData: async () => undefined,
  });

  assert.deepEqual(result, {
    ok: true,
    path: "about.json",
    slug: "about",
    slugs: ["about", "works/penguin"],
  });
});

test("publishPuckPage propagates write failures", async () => {
  await assert.rejects(
    publishPuckPage({
      data: pageData,
      listPageSlugs: async () => ["about"],
      normalizedSlug,
      writePageData: async () => {
        throw new Error("write failed");
      },
    }),
    /write failed/,
  );
});
