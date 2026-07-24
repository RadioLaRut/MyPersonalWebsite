import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  SHARP_MEDIA_INPUT_OPTIONS,
  validateMediaMetadata,
} from "../src/lib/media-budget.ts";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const rasterPattern = /\.(?:avif|gif|jpe?g|png|webp)$/iu;

test("all tracked raster assets satisfy the shared static media budget", async () => {
  const trackedOutput = execFileSync(
    "git",
    ["ls-files", "-z", "--", "public"],
    { cwd: projectRoot, encoding: "utf8" },
  );
  const relativePaths = trackedOutput
    .split("\0")
    .filter((filePath) => rasterPattern.test(filePath))
    .sort();

  assert.ok(relativePaths.length > 0);
  for (const relativePath of relativePaths) {
    const metadata = await sharp(
      path.resolve(projectRoot, relativePath),
      SHARP_MEDIA_INPUT_OPTIONS,
    ).metadata();
    assert.doesNotThrow(
      () => validateMediaMetadata(metadata),
      relativePath,
    );
  }
});
