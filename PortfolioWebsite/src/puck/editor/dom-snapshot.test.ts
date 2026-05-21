import assert from "node:assert/strict";
import test from "node:test";

import { ADMIN_MODE_ATTRIBUTE, ADMIN_ROOT_ATTRIBUTE } from "../../lib/admin-attributes.ts";
import { restoreElement, snapshotElement } from "./dom-snapshot.ts";

function makeElement() {
  const attrs = new Map<string, string>();
  return {
    className: "before",
    lang: "zh-CN",
    style: {
      height: "100%",
      overflow: "hidden",
      overscrollBehavior: "contain",
    },
    getAttribute(name: string) {
      return attrs.get(name) ?? null;
    },
    removeAttribute(name: string) {
      attrs.delete(name);
    },
    setAttribute(name: string, value: string) {
      attrs.set(name, value);
    },
  };
}

test("restoreElement restores class, style, attributes, and lang", () => {
  const element = makeElement();
  element.setAttribute(ADMIN_MODE_ATTRIBUTE, "before");
  const snapshot = snapshotElement(element, {
    attributes: [ADMIN_MODE_ATTRIBUTE, ADMIN_ROOT_ATTRIBUTE],
    includeLang: true,
  });

  element.className = "after";
  element.lang = "en";
  element.style.height = "";
  element.style.overflow = "";
  element.style.overscrollBehavior = "";
  element.setAttribute(ADMIN_MODE_ATTRIBUTE, "after");
  element.setAttribute(ADMIN_ROOT_ATTRIBUTE, "after");

  restoreElement(element, snapshot);

  assert.equal(element.className, "before");
  assert.equal(element.lang, "zh-CN");
  assert.equal(element.style.height, "100%");
  assert.equal(element.style.overflow, "hidden");
  assert.equal(element.style.overscrollBehavior, "contain");
  assert.equal(element.getAttribute(ADMIN_MODE_ATTRIBUTE), "before");
  assert.equal(element.getAttribute(ADMIN_ROOT_ATTRIBUTE), null);
});
