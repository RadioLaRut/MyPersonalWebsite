import assert from "node:assert/strict";
import test from "node:test";

import { applyFontLabCssVars } from "./font-lab-css-vars.ts";

function createStyleTarget() {
  const values = new Map<string, string>();
  let removeCount = 0;
  let setCount = 0;

  return {
    get removeCount() {
      return removeCount;
    },
    get setCount() {
      return setCount;
    },
    target: {
      style: {
        getPropertyValue(key: string) {
          return values.get(key) ?? "";
        },
        removeProperty(key: string) {
          removeCount += 1;
          values.delete(key);
        },
        setProperty(key: string, value: string) {
          setCount += 1;
          values.set(key, value);
        },
      },
    } as unknown as HTMLElement,
  };
}

test("applyFontLabCssVars skips writes when values are unchanged", () => {
  const previousKeys = new Set<string>();
  const styleTarget = createStyleTarget();

  applyFontLabCssVars(styleTarget.target, { "--typography-test": "1rem" }, previousKeys);
  applyFontLabCssVars(styleTarget.target, { "--typography-test": "1rem" }, previousKeys);

  assert.equal(styleTarget.setCount, 1);
});

test("applyFontLabCssVars removes keys no longer present", () => {
  const previousKeys = new Set<string>();
  const styleTarget = createStyleTarget();

  applyFontLabCssVars(styleTarget.target, { "--typography-test": "1rem" }, previousKeys);
  applyFontLabCssVars(styleTarget.target, {}, previousKeys);

  assert.equal(styleTarget.removeCount, 1);
});
