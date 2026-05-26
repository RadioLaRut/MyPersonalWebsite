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
});

test("isNonEmptyString accepts only strings with non-whitespace content", () => {
  assert.equal(isNonEmptyString("value"), true);
  assert.equal(isNonEmptyString(" value "), true);
  assert.equal(isNonEmptyString(""), false);
  assert.equal(isNonEmptyString("   "), false);
  assert.equal(isNonEmptyString(null), false);
  assert.equal(isNonEmptyString(1), false);
});
