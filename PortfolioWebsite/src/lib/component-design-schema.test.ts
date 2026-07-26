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

test("normalizeComponentDesignDocument falls back for invalid responsive grid bounds", () => {
  const normalized = normalizeComponentDesignDocument({
    components: {
      HeroSection: {
        contentBounds: {
          base: {
            leftCol: 12,
            rightCol: 3,
          },
          md: {
            leftCol: 11,
            rightCol: 2,
          },
          lg: {
            leftCol: 9,
            rightCol: 2,
          },
        },
      },
    },
    version: 1,
  });

  assert.deepEqual(
    normalized.components.HeroSection.contentBounds,
    createDefaultComponentDesignDocument().components.HeroSection.contentBounds,
  );
});

test("normalizeComponentDesignDocument migrates legacy HeroSection title bounds", () => {
  const normalized = normalizeComponentDesignDocument({
    components: {
      HeroSection: {
        titleBounds: {
          base: {
            leftCol: 1,
            rightCol: 12,
          },
          md: {
            leftCol: 2,
            rightCol: 11,
          },
          lg: {
            leftCol: 3,
            rightCol: 8,
          },
        },
      },
    },
    version: 1,
  });

  assert.equal(normalized.components.HeroSection.contentBounds.lg.leftCol, 3);
  assert.equal(normalized.components.HeroSection.contentBounds.lg.rightCol, 8);
  assert.equal(normalized.components.HeroSection.contentBounds.md.leftCol, 2);
  assert.equal(normalized.components.HeroSection.contentBounds.md.rightCol, 11);
});

test("normalizeComponentDesignDocument migrates legacy responsive bounds without md", () => {
  const normalized = normalizeComponentDesignDocument({
    components: {
      HeroSection: {
        contentBounds: {
          base: { leftCol: 1, rightCol: 12 },
          lg: { leftCol: 8, rightCol: 12 },
        },
      },
    },
    version: 1,
  });

  assert.deepEqual(normalized.components.HeroSection.contentBounds.md, {
    leftCol: 1,
    rightCol: 12,
  });
});

test("normalizeComponentDesignDocument hydrates newly added component defaults", () => {
  const normalized = normalizeComponentDesignDocument({
    components: {
      RichParagraph: {
        bodySize: "body",
      },
    },
    version: 1,
  });

  assert.deepEqual(
    normalized.components.HeroHeadline,
    createDefaultComponentDesignDocument().components.HeroHeadline,
  );
  assert.deepEqual(
    normalized.components.ContactFlashlight,
    createDefaultComponentDesignDocument().components.ContactFlashlight,
  );
});

test("createDefaultComponentDesignDocument preserves legacy BreakdownTriptych spacing defaults", () => {
  const defaults = createDefaultComponentDesignDocument();

  assert.equal(defaults.components.BreakdownTriptych.sectionSpacing, "block-compact");
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
  assert.equal(parsed.components.TextSplitLayout.stackBounds.rightCol, 9);
  assert.equal(parsed.components.TextSplitLayout.stackTextTopSpacing, "24");
  assert.equal(parsed.components.HeroSection.contentBounds.lg.leftCol, 8);
  assert.equal(parsed.components.HeroSection.eyebrowTopSpacing, "12");
  assert.equal(parsed.components.ProjectSection.lockupGap, "12");
  assert.equal(parsed.components.ProjectSection.titleSize, "display");
  assert.equal(parsed.components.ProjectSection.titleUnderlineOpticalPull, "12");
  assert.equal(parsed.components.WorksList.headingBottomSpacing, "32");
  assert.equal(parsed.components.HomeEndcapSection.titleSize, "display");
});
