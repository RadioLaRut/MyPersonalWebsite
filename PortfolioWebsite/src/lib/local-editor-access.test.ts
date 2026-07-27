import assert from "node:assert/strict";
import test from "node:test";

import {
  getLocalEditorAccessHeaders,
  getLocalEditorAccessToken,
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_STORAGE_KEY,
  setLocalEditorAccessToken,
} from "./local-editor-access.ts";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

test("local editor token is trimmed, stored, and sent through the editor header", () => {
  const storage = createMemoryStorage();

  assert.equal(setLocalEditorAccessToken("  computer-a-token  ", storage), true);
  assert.equal(
    storage.getItem(LOCAL_EDITOR_ACCESS_STORAGE_KEY),
    "computer-a-token",
  );
  assert.equal(getLocalEditorAccessToken(storage), "computer-a-token");
  assert.deepEqual(getLocalEditorAccessHeaders(storage), {
    [LOCAL_EDITOR_ACCESS_HEADER]: "computer-a-token",
  });
});

test("blank local editor tokens are rejected without replacing the stored token", () => {
  const storage = createMemoryStorage();
  storage.setItem(LOCAL_EDITOR_ACCESS_STORAGE_KEY, "existing-token");

  assert.equal(setLocalEditorAccessToken("   ", storage), false);
  assert.equal(getLocalEditorAccessToken(storage), "existing-token");
});

test("server-side access helpers do not fabricate a browser token", () => {
  assert.equal(getLocalEditorAccessToken(null), null);
  assert.equal(setLocalEditorAccessToken("token", null), false);
  assert.deepEqual(getLocalEditorAccessHeaders(null), {});
});
