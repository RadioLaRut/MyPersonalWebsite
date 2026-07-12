import assert from "node:assert/strict";
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
