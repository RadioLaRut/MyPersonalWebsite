import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  collectImageLibraryUsage,
  ensureDefaultUploadDirectory,
  ImageLibraryError,
  listImageLibraryDirectory,
  resolveImageLibraryDirectory,
  resolveUploadDestination,
} from "./image-library-server.ts";

function imagePath(...segments: string[]) {
  return ["", "images", ...segments].join("/");
}

async function createFixture(t: test.TestContext) {
  const temporaryRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "portfolio-image-library-"),
  );
  const imageRoot = path.join(temporaryRoot, "images");
  const outsideRoot = path.join(temporaryRoot, "outside");

  await fs.mkdir(path.join(imageRoot, "penguin", "PCG"), { recursive: true });
  await fs.mkdir(outsideRoot, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(imageRoot, "penguin", "CyberRestaurant.webp"),
      "webp",
    ),
    fs.writeFile(path.join(imageRoot, "penguin", "作品图.png"), "png"),
    fs.writeFile(path.join(imageRoot, "penguin", "preview.webm"), "video"),
    fs.writeFile(path.join(imageRoot, "penguin", "source.psd"), "psd"),
    fs.writeFile(path.join(imageRoot, "penguin", ".DS_Store"), "metadata"),
  ]);
  await fs.symlink(outsideRoot, path.join(imageRoot, "escape"), "dir");

  t.after(async () => {
    await fs.rm(temporaryRoot, { force: true, recursive: true });
  });

  return { imageRoot };
}

test("图片库只列出直接子目录和支持的非隐藏媒体", async (t) => {
  const { imageRoot } = await createFixture(t);

  const rootListing = await listImageLibraryDirectory(imageRoot, "/images");
  assert.deepEqual(rootListing, {
    directory: "/images",
    entries: [
      {
        kind: "directory",
        name: "penguin",
        path: "/images/penguin",
      },
    ],
    parent: null,
  });

  const nestedListing = await listImageLibraryDirectory(
    imageRoot,
    "/images/penguin",
  );
  assert.deepEqual(
    nestedListing.entries.map(({ kind, name }) => ({ kind, name })),
    [
      { kind: "directory", name: "PCG" },
      { kind: "image", name: "作品图.png" },
      { kind: "image", name: "CyberRestaurant.webp" },
      { kind: "video", name: "preview.webm" },
    ],
  );
  assert.equal(nestedListing.parent, "/images");
});

test("图片库拒绝大小写不匹配、目录穿越和符号链接", async (t) => {
  const { imageRoot } = await createFixture(t);
  const linkedRoot = path.join(path.dirname(imageRoot), "images-link");
  await fs.symlink(imageRoot, linkedRoot, "dir");

  for (const invalidDirectory of [
    imagePath("Penguin"),
    imagePath("..", "outside"),
    imagePath("escape"),
  ]) {
    await assert.rejects(
      () => resolveImageLibraryDirectory(imageRoot, invalidDirectory),
      (error) =>
        error instanceof ImageLibraryError &&
        ["BAD_REQUEST", "NOT_FOUND"].includes(error.code),
      invalidDirectory,
    );
  }
  await assert.rejects(
    () => resolveImageLibraryDirectory(linkedRoot, "/images"),
    (error) =>
      error instanceof ImageLibraryError && error.code === "BAD_REQUEST",
  );
});

test("上传目录与目标文件始终位于图片库内部", async (t) => {
  const { imageRoot } = await createFixture(t);
  await ensureDefaultUploadDirectory(imageRoot);

  const defaultDirectory = await resolveImageLibraryDirectory(
    imageRoot,
    imagePath("puck"),
  );
  const target = resolveUploadDestination(
    defaultDirectory,
    "hero-1234.webp",
  );

  assert.equal(target.publicPath, imagePath("puck", "hero-1234.webp"));
  assert.equal(
    target.absolutePath,
    path.join(await fs.realpath(imageRoot), "puck", "hero-1234.webp"),
  );
  assert.throws(
    () => resolveUploadDestination(defaultDirectory, "../escape.webp"),
    ImageLibraryError,
  );
});

test("图片库配额统计不跟随符号链接", async (t) => {
  const { imageRoot } = await createFixture(t);
  const usage = await collectImageLibraryUsage(imageRoot);

  assert.deepEqual(usage, {
    bytes: 4 + 3 + 5 + 3 + 8,
    files: 5,
  });
});
