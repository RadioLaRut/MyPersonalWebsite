import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  getFirstViewportFontFaceIds,
  getPublicFontHints,
  type PublicFontSubsetManifestV1,
} from "./public-font-delivery.ts";
import { parseCurrentPageDocument } from "./page-document-contract.ts";

function readPage(relativePath: string) {
  return parseCurrentPageDocument(
    JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "content/pages", relativePath),
        "utf8",
      ),
    ),
  );
}

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "src/generated/public-font-subsets.json"),
    "utf8",
  ),
) as PublicFontSubsetManifestV1;

function familyFaceIds(familyId: string) {
  return manifest.faces
    .filter((face) => face.familyId === familyId)
    .map((face) => face.id);
}

test("公开字体提示只投影真实使用字体的首屏文本", () => {
  for (const filePath of ["index.json", "about.json", "works/penguin.json"]) {
    const hints = getPublicFontHints(readPage(filePath), manifest);
    assert.ok(hints.length <= 4);
    assert.equal(new Set(hints.map((hint) => hint.href)).size, hints.length);
    assert.ok(hints.every((hint) => hint.href.endsWith(".woff2")));
  }

  assert.deepEqual(
    getFirstViewportFontFaceIds(readPage("index.json"), manifest),
    familyFaceIds("luna-itc"),
  );
  assert.ok(
    getFirstViewportFontFaceIds(readPage("about.json"), manifest).length > 0,
  );
  assert.ok(
    getFirstViewportFontFaceIds(readPage("works.json"), manifest).length > 0,
  );
  assert.deepEqual(
    getFirstViewportFontFaceIds(readPage("works/penguin.json"), manifest),
    ["source-han-serif-sc"],
  );
});

test("首屏字体提示按 Typography 文本脚本投影对应子集字面", () => {
  const homepage = readPage("index.json");
  const chineseSansCopyOnly = structuredClone(homepage);
  chineseSansCopyOnly.content[0].props.title = "JIANG CHENGYAN";
  chineseSansCopyOnly.content[0].props.positioning = "这段中文使用 sans-body";
  assert.deepEqual(
    getFirstViewportFontFaceIds(chineseSansCopyOnly, manifest),
    familyFaceIds("luna-itc"),
  );

  const chineseEditorialTitle = structuredClone(homepage);
  chineseEditorialTitle.content[0].props.title = "中文标题";
  assert.deepEqual(
    getFirstViewportFontFaceIds(chineseEditorialTitle, manifest),
    ["source-han-serif-sc"],
  );
});
