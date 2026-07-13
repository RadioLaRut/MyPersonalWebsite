import assert from "node:assert/strict";
import test from "node:test";

import { preparePageDocumentMigration } from "./page-document-migration.ts";
import { PAGE_DOCUMENT_VERSION, PageDocumentValidationError } from "./page-document-contract.ts";

function createCurrentDocument() {
  return {
    content: [],
    root: {
      props: {
        description: "Keep this description",
        image: "/images/train-station/2Day.webp",
        noIndex: true,
        title: "Current",
      },
    },
    version: PAGE_DOCUMENT_VERSION,
    zones: {},
  };
}

test("current documents are validated without rewriting authoritative SEO", () => {
  const current = createCurrentDocument();
  const result = preparePageDocumentMigration(current, {
    description: "Replacement description",
    noIndex: false,
  });

  assert.equal(result.migrated, false);
  assert.deepEqual(result.document, current);
});

test("legacy documents receive migration-only SEO defaults and an image projection", () => {
  const result = preparePageDocumentMigration({
    content: [{
      props: {
        eyebrow: "Work",
        heroImage: "/images/train-station/2Day.webp",
        heroImageFitMode: "x",
        heroImagePreset: "ratio-16-9",
        navLink: "/works",
        navLinkLabel: "Back",
        subtitle: "Subtitle",
        title: "Title",
      },
      type: "HeroHeadline",
    }],
    root: { props: { title: "Legacy" } },
    zones: {},
  }, {
    description: "Migrated description",
    noIndex: true,
  });

  assert.equal(result.migrated, true);
  assert.deepEqual(result.document.root.props, {
    description: "Migrated description",
    image: "/images/train-station/2Day.webp",
    noIndex: true,
    title: "Legacy",
  });
});

test("new legacy slugs can fall back to their title without a hardcoded SEO entry", () => {
  const result = preparePageDocumentMigration({
    content: [],
    root: { props: { title: "New Legacy Page" } },
    zones: {},
  });

  assert.equal(result.migrated, true);
  assert.equal(result.document.root.props.description, "New Legacy Page");
});

test("future document versions are rejected instead of treated as legacy", () => {
  assert.throws(
    () => preparePageDocumentMigration({
      ...createCurrentDocument(),
      version: PAGE_DOCUMENT_VERSION + 1,
    }),
    PageDocumentValidationError,
  );
});
