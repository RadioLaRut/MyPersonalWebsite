import assert from "node:assert/strict";
import test from "node:test";

import {
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument,
  parseComponentDesignDocument,
} from "./component-design-schema.ts";

test("normalizeComponentDesignDocument falls back for invalid grid bounds", () => {
  const normalized = normalizeComponentDesignDocument({
    components: {
      RichParagraph: {
        bodySize: "body",
        contentBounds: {
          leftCol: 9,
          rightCol: 3,
        },
        sectionSpacing: "section-normal",
      },
    },
    version: 1,
  });

  assert.deepEqual(
    normalized.components.RichParagraph.contentBounds,
    createDefaultComponentDesignDocument().components.RichParagraph.contentBounds,
  );
});

test("parseComponentDesignDocument rejects invalid version", () => {
  const parsed = parseComponentDesignDocument({
    components: {},
    version: 999,
  });

  assert.equal(parsed, null);
});

test("parseComponentDesignDocument accepts valid component config", () => {
  const parsed = parseComponentDesignDocument(
    createDefaultComponentDesignDocument(),
  );

  assert.ok(parsed);
  assert.equal(parsed.components.ContentCard.titleSize, "title");
  assert.equal(parsed.components.TextSplitLayout.stackBounds.rightCol, 10);
});
