import assert from "node:assert/strict";
import test from "node:test";

import { openDetachedWindow } from "./open-detached-window.ts";

test("public editor links open in a detached browsing context", () => {
  const calls: unknown[][] = [];
  const openedWindow: { opener: unknown } = { opener: { inherited: true } };

  openDetachedWindow("/works/penguin", (...args) => {
    calls.push(args);
    return openedWindow as unknown as Window;
  });

  assert.deepEqual(calls, [[
    "/works/penguin",
    "_blank",
    "noopener,noreferrer",
  ]]);
  assert.equal(openedWindow.opener, null);
});

test("a browser returning no window handle remains supported", () => {
  assert.doesNotThrow(() => openDetachedWindow("/", () => null));
});
