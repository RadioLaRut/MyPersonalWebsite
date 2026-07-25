import assert from "node:assert/strict";
import test from "node:test";

import { createElement, type ReactNode } from "react";

import {
  getInlineEditableTextValue,
  hasEditableTextContent,
  resolveEditableText,
  toParagraphNodes,
  toPlainText,
} from "./editable-text.ts";

function InlineEditableText() {
  return null;
}

function createInlineEditableText(value: string): ReactNode {
  return createElement(InlineEditableText, {
    componentId: "hero-section-1",
    propPath: "title",
    value,
  });
}

test("reads the raw value carried by Puck inline text nodes", () => {
  const node = createInlineEditableText("JIANG\nCHENGYAN");

  assert.equal(getInlineEditableTextValue(node), "JIANG\nCHENGYAN");
  assert.equal(toPlainText(node), "JIANG\nCHENGYAN");
  assert.equal(hasEditableTextContent(node), true);
});

test("treats an empty Puck inline text node like the original empty string", () => {
  const node = createInlineEditableText("   ");

  assert.equal(hasEditableTextContent(node), false);
  assert.equal(resolveEditableText(node, "Fallback"), "Fallback");
  assert.deepEqual(toParagraphNodes(node), []);
});

test("preserves a populated Puck inline text node for canvas editing", () => {
  const node = createInlineEditableText("Editable");

  assert.equal(resolveEditableText(node, "Fallback"), node);
  assert.deepEqual(toParagraphNodes(node), [node]);
});
