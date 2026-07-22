import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  getResponsiveImageElementClassName,
  isValidImagePresentationCombination,
} from "./image-presentation.ts";

test("responsive image fit applies base, md, and lg modes independently", () => {
  const className = getResponsiveImageElementClassName("ratio-21-9", "x", {
    base: "cover",
    md: "y",
    lg: "x",
  });

  assert.match(className, /object-cover/);
  assert.match(className, /md:h-full/);
  assert.match(className, /lg:w-full/);
  assert.match(className, /responsive-preset-image/);
});

test("native image preset only accepts the intrinsic x mode", () => {
  assert.equal(isValidImagePresentationCombination("native", "x"), true);
  assert.equal(isValidImagePresentationCombination("native", "y"), false);
  assert.equal(isValidImagePresentationCombination("native", "cover"), false);
  assert.equal(isValidImagePresentationCombination("ratio-16-9", "cover"), true);
});

test("responsive native image rendering ignores invalid fit overrides", () => {
  const className = getResponsiveImageElementClassName("native", "cover", {
    base: "cover",
    lg: "y",
  });

  assert.equal(className, "block w-full h-auto");
});

test("ImageSlider keeps the clipped unlit image above the lit base image", () => {
  const componentSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/breakdowns/ImageSlider.tsx"),
    "utf8",
  );

  assert.match(
    componentSource,
    /data-image-slider-layer="lit"[\s\S]{0,180}\bz-0\b/,
  );
  assert.match(
    componentSource,
    /data-image-slider-layer="unlit"[\s\S]{0,180}\bz-10\b/,
  );
});
