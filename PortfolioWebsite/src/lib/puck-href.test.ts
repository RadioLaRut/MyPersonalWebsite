import assert from "node:assert/strict";
import test from "node:test";

import { toEditorAwareHref, toSafePuckHref } from "./puck-href.ts";

test("toSafePuckHref rejects dangerous protocols and control characters", () => {
  assert.equal(toSafePuckHref("javascript:alert(1)"), undefined);
  assert.equal(toSafePuckHref(" JaVaScRiPt:alert(1)"), undefined);
  assert.equal(toSafePuckHref("data:text/html,<script>alert(1)</script>"), undefined);
  assert.equal(toSafePuckHref("https://example.com/ok\n"), undefined);
});

test("toSafePuckHref preserves legitimate local, fragment, and external links", () => {
  assert.equal(toSafePuckHref("/works/penguin"), "/works/penguin");
  assert.equal(toSafePuckHref("#overview"), "#overview");
  assert.equal(toSafePuckHref("https://example.com/ok"), "https://example.com/ok");
  assert.equal(toSafePuckHref("mailto:hello@example.com"), "mailto:hello@example.com");
  assert.equal(toSafePuckHref("tel:+123456789"), "tel:+123456789");
});

test("toEditorAwareHref keeps editor path rewriting only for safe local paths", () => {
  assert.equal(toEditorAwareHref("/works/penguin", true), "/admin/works/penguin");
  assert.equal(toEditorAwareHref("javascript:alert(1)", true), undefined);
  assert.equal(toEditorAwareHref("https://example.com/ok", true), "https://example.com/ok");
});
