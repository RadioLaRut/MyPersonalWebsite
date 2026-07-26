import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { resolveImageLoadState } from "./image-load-coordinator.ts";

test("图片加载快照区分等待、成功与失败", () => {
  assert.equal(
    resolveImageLoadState({ complete: false, naturalWidth: 0 }),
    "loading",
  );
  assert.equal(
    resolveImageLoadState({ complete: true, naturalWidth: 720 }),
    "loaded",
  );
  assert.equal(
    resolveImageLoadState({ complete: true, naturalWidth: 0 }),
    "error",
  );
});

test("Puck iframe 预览接入页面级图片加载协调器并在卸载时清理", () => {
  const previewChromeSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/puck/editor/iframe-preview-chrome.tsx"),
    "utf8",
  );

  assert.match(
    previewChromeSource,
    /const stopImageLoadCoordination = coordinateImageLoading\(frameDocument\)/,
  );
  assert.match(previewChromeSource, /stopImageLoadCoordination\(\)/);
});
