import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { isolateEditorTextInputEvent } from "./text-input-events.ts";

test("isolateEditorTextInputEvent stops bubbling without cancelling native editing", () => {
  let propagationStops = 0;
  let defaultCancellations = 0;
  const event = {
    stopPropagation: () => {
      propagationStops += 1;
    },
    preventDefault: () => {
      defaultCancellations += 1;
    },
  };

  isolateEditorTextInputEvent(event);

  assert.equal(propagationStops, 1);
  assert.equal(defaultCancellations, 0);
});

test("Chinese text inputs and editor CSS share a stable selection marker", async () => {
  const [componentSource, styleSource] = await Promise.all([
    readFile(new URL("./ChineseTextField.tsx", import.meta.url), "utf8"),
    readFile(new URL("../editor-shell.module.css", import.meta.url), "utf8"),
  ]);

  assert.equal(componentSource.match(/data-puck-text-input="true"/g)?.length, 2);
  assert.match(styleSource, /\[data-puck-text-input="true"\]::selection/);
  assert.match(styleSource, /\[data-puck-text-input="true"\]::-moz-selection/);
});
