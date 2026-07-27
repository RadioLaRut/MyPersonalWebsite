import assert from "node:assert/strict";
import test from "node:test";

import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  COMPONENT_DESIGN_MANIFEST,
} from "./component-design-manifest.ts";
import {
  createDefaultComponentDesignDocument,
  parseCurrentComponentDesignDocument,
} from "./component-design-v2.ts";

test("V2 设计文档恰好覆盖 17 个页面级组件和全部合法版式", () => {
  const document = createDefaultComponentDesignDocument();

  assert.deepEqual(
    Object.keys(document.components),
    [...COMPONENT_DESIGN_AUTHOR_COMPONENTS],
  );
  for (const entry of COMPONENT_DESIGN_MANIFEST) {
    assert.deepEqual(
      Object.keys(document.components[entry.component].variants),
      entry.variants.map((variant) => variant.id),
      entry.component,
    );
  }
  assert.ok(parseCurrentComponentDesignDocument(document));
});

test("内部 Slot 组件不出现在 V2 顶层作用域", () => {
  const keys = Object.keys(createDefaultComponentDesignDocument().components);
  assert.equal(keys.includes("WorksListEntry"), false);
  assert.equal(keys.includes("MetadataListItem"), false);
  assert.equal(keys.includes("TextParagraphBlock"), false);
});
