import assert from "node:assert/strict";
import test from "node:test";

import {
  getImageLibraryDirectoryForAsset,
  getImageLibraryParentDirectory,
  getMediaAssetKind,
  isSupportedPublicMediaPath,
  joinImageLibraryPath,
  tryNormalizeImageLibraryDirectory,
} from "./media-library-paths.ts";

function imagePath(...segments: string[]) {
  return ["", "images", ...segments].join("/");
}

test("图片库目录只接受 /images 下的站点根相对路径", () => {
  assert.equal(tryNormalizeImageLibraryDirectory("/images"), "/images");
  assert.equal(
    tryNormalizeImageLibraryDirectory("/images/penguin/PCG"),
    "/images/penguin/PCG",
  );
  assert.equal(
    tryNormalizeImageLibraryDirectory(imagePath("灯光练习")),
    imagePath("灯光练习"),
  );

  for (const invalidPath of [
    "/Users/baixi/Pictures",
    "images/penguin",
    "file:///images/penguin",
    "https://example.com/images",
    imagePath("..", "secret"),
    imagePath("penguin\\PCG"),
    imagePath("%2e%2e", "secret"),
    imagePath("", "penguin"),
    `${imagePath("penguin")}/`,
  ]) {
    assert.equal(
      tryNormalizeImageLibraryDirectory(invalidPath),
      null,
      invalidPath,
    );
  }
});

test("媒体路径支持安全 Unicode 文件名并严格区分图片与视频", () => {
  const unicodeImage = "/images/covers/2025/作品集封面.webp";
  assert.equal(getMediaAssetKind(unicodeImage), "image");
  assert.equal(isSupportedPublicMediaPath(unicodeImage, "image"), true);
  assert.equal(isSupportedPublicMediaPath(unicodeImage, "video"), false);
  assert.equal(getMediaAssetKind(imagePath("video", "demo.webm")), "video");

  for (const invalidPath of [
    imagePath("design.psd"),
    imagePath(".hidden.webp"),
    imagePath("a%20b.webp"),
    imagePath("a#b.webp"),
    imagePath("a?b.webp"),
    imagePath("..", "escape.webp"),
    "https://example.com/image.webp",
  ]) {
    assert.equal(getMediaAssetKind(invalidPath), null, invalidPath);
  }
});

test("图片库路径组合、父级与当前资源目录保持站点相对语义", () => {
  assert.equal(
    joinImageLibraryPath("/images/penguin", "CyberRestaurant.webp"),
    "/images/penguin/CyberRestaurant.webp",
  );
  assert.equal(joinImageLibraryPath("/images/penguin", "../escape.webp"), null);
  assert.equal(getImageLibraryParentDirectory("/images"), null);
  assert.equal(
    getImageLibraryParentDirectory("/images/penguin/PCG"),
    "/images/penguin",
  );
  assert.equal(
    getImageLibraryDirectoryForAsset(
      "/images/penguin/CyberRestaurant.webp",
    ),
    "/images/penguin",
  );
  assert.equal(
    getImageLibraryDirectoryForAsset("/assets/images/placeholder.svg"),
    "/images",
  );
});
