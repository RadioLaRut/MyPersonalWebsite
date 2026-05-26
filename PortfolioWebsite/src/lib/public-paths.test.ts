import assert from "node:assert/strict";
import test from "node:test";

import {
  splitPublicPathSegments,
  normalizeLegacyPublicPath,
  normalizeEditorPathInputToSlugKey,
  toAdminPathFromPublicPath,
  tryNormalizeLegacyPublicRedirectPath,
  tryNormalizePublicPath,
} from "./public-paths.ts";

test("splitPublicPathSegments keeps exact casing while normalizing slashes", () => {
  assert.deepEqual(splitPublicPathSegments("/Images//Gallery/CaseImage.webp/"), [
    "Images",
    "Gallery",
    "CaseImage.webp",
  ]);
  assert.deepEqual(splitPublicPathSegments(""), []);
  assert.deepEqual(splitPublicPathSegments("/"), []);
});

test("splitPublicPathSegments rejects backslash-separated paths", () => {
  // 这里刻意拼接，确保反斜杠作为路径内容进入被测函数，而不是被读者误当作源码转义。
  const invalidAssetPath = "/images/" + "gallery\\CaseImage.webp";

  assert.equal(splitPublicPathSegments(invalidAssetPath), null);
});

test("tryNormalizeLegacyPublicRedirectPath maps /p legacy paths to canonical public paths", () => {
  assert.equal(tryNormalizeLegacyPublicRedirectPath("/p"), "/");
  assert.equal(tryNormalizeLegacyPublicRedirectPath("/p/works/im-explod-with-u"), "/works/im-explode");
});

test("normalizeLegacyPublicPath keeps a safe homepage fallback for nullish inputs", () => {
  assert.equal(normalizeLegacyPublicPath(null), "/");
  assert.equal(normalizeLegacyPublicPath(undefined), "/");
});

test("tryNormalizePublicPath does not absorb admin editor prefixes", () => {
  assert.equal(tryNormalizePublicPath("/admin"), null);
  assert.equal(tryNormalizePublicPath("/admin/works/Penguin"), null);
});

test("toAdminPathFromPublicPath keeps admin paths and converts public paths", () => {
  assert.equal(toAdminPathFromPublicPath("/admin"), "/admin");
  assert.equal(toAdminPathFromPublicPath("/admin/works/Penguin"), "/admin/works/penguin");
  assert.equal(toAdminPathFromPublicPath("/works/penguin"), "/admin/works/penguin");
  assert.equal(toAdminPathFromPublicPath(""), "/admin");
});

test("normalizeEditorPathInputToSlugKey absorbs public, legacy, and admin prefixes", () => {
  assert.equal(normalizeEditorPathInputToSlugKey(""), "index");
  assert.equal(normalizeEditorPathInputToSlugKey("/admin"), "index");
  assert.equal(normalizeEditorPathInputToSlugKey("/admin/works/Penguin"), "works/penguin");
  assert.equal(normalizeEditorPathInputToSlugKey("/p/works/im-explod-with-u"), "works/im-explode");
});

test("analyzePublicPath validates and redirects work aliases in one pass", async () => {
  const { analyzePublicPath } = await import("./public-paths.ts");

  assert.deepEqual(analyzePublicPath("/works/penguin"), {
    canonical: "/works/penguin",
    kind: "ok",
    segments: ["works", "penguin"],
  });
  assert.deepEqual(analyzePublicPath("/works/penguin-trading-company"), {
    kind: "redirect",
    to: "/works/penguin",
  });
  assert.deepEqual(analyzePublicPath("/works/%ZZ"), { kind: "bad" });
});

test("public path normalizers reject invalid encoding, backslashes, and traversal", () => {
  for (const invalidPath of ["/p/%ZZ", "/p/a\\b", "/p/a/../b", "/works/%ZZ", "/works/a\\b", "/works/a/../b"]) {
    assert.equal(tryNormalizePublicPath(invalidPath), null, invalidPath);
  }
});
