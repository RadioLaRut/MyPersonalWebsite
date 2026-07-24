import assert from "node:assert/strict";
import test from "node:test";

import { isJsonValue, isNonEmptyString, isPlainRecord } from "./json-utils.ts";

test("isPlainRecord accepts plain object records only", () => {
  assert.equal(isPlainRecord({}), true);
  assert.equal(isPlainRecord({ value: 1 }), true);
  assert.equal(isPlainRecord([]), false);
  assert.equal(isPlainRecord(null), false);
});

test("isJsonValue accepts nested JSON-compatible values", () => {
  assert.equal(isJsonValue({
    items: ["text", 1, true, null],
    nested: { ok: false },
  }), true);
});

test("isJsonValue rejects non-JSON values", () => {
  assert.equal(isJsonValue(undefined), false);
  assert.equal(isJsonValue(() => undefined), false);
  assert.equal(isJsonValue({ bad: undefined }), false);
  assert.equal(isJsonValue(Number.NaN), false);
  assert.equal(isJsonValue(Number.POSITIVE_INFINITY), false);
  const cyclic: unknown[] = [];
  cyclic.push(cyclic);
  assert.equal(isJsonValue(cyclic), false);
});

test("isJsonValue does not depend on variadic array expansion", () => {
  const values = [null, true, "text"];
  Object.defineProperty(values, Symbol.iterator, {
    configurable: true,
    value() {
      throw new Error("array iteration must not be used");
    },
  });

  assert.equal(JSON.stringify(values), '[null,true,"text"]');
  assert.equal(isJsonValue(values), true);
});

test("isNonEmptyString accepts only strings with non-whitespace content", () => {
  assert.equal(isNonEmptyString("value"), true);
  assert.equal(isNonEmptyString(" value "), true);
  assert.equal(isNonEmptyString(""), false);
  assert.equal(isNonEmptyString("   "), false);
  assert.equal(isNonEmptyString(null), false);
  assert.equal(isNonEmptyString(1), false);
});
