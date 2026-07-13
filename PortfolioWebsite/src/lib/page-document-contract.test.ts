import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  ContentPersistenceError,
  ContentRepository,
  StoredContentInvalidError,
} from "./content-repository.ts";
import type { JsonValue } from "./puck-content.ts";
import {
  PAGE_DOCUMENT_VERSION,
  PageDocumentValidationError,
  migrateLegacyPageDocument,
  parsePageDocument,
  validatePageReferences,
  validateCurrentPageDocument,
} from "./page-document-contract.ts";

function createDocument(content: unknown[] = []) {
  return {
    content,
    root: {
      props: {
        description: "A portfolio page",
        image: "",
        noIndex: false,
        title: "Test Page",
      },
    },
    version: PAGE_DOCUMENT_VERSION,
    zones: {},
  };
}

test("legacy documents migrate explicitly to the current SEO contract", () => {
  const legacy = {
    content: [{ props: { content: "Hello" }, type: "RichParagraph" }],
    root: { props: { title: "Legacy" } },
    zones: {},
  };
  assert.throws(
    () => parsePageDocument(legacy),
    (error) => error instanceof PageDocumentValidationError &&
      error.issues.some((issue) => issue.path === "$.version"),
  );

  const migrated = migrateLegacyPageDocument(legacy);

  assert.deepEqual(validateCurrentPageDocument(migrated), []);
  assert.deepEqual((migrated as ReturnType<typeof createDocument>).root.props, {
    description: "Legacy",
    image: "",
    noIndex: false,
    title: "Legacy",
  });
});

test("Triptych images validate non-empty paths while preserving optional empty images", () => {
  const triptychProps = {
    col1Img: "relative.webp",
    col1Text: "One",
    col1Title: "One",
    col2Img: "",
    col2Text: "Two",
    col2Title: "Two",
    col3Img: "",
    col3Text: "Three",
    col3Title: "Three",
    id: "triptych-1",
  };
  assert.throws(
    () => parsePageDocument(createDocument([{
      props: triptychProps,
      type: "BreakdownTriptych",
    }])),
    (error) => error instanceof PageDocumentValidationError &&
      error.issues.some((issue) => issue.path.endsWith(".col1Img")),
  );

  const document = parsePageDocument(createDocument([{
    props: {
      ...triptychProps,
      col1Img: ["", "images", "definitely-missing.webp"].join("/"),
    },
    type: "BreakdownTriptych",
  }]));
  const publicRoot = fs.mkdtempSync(path.join(os.tmpdir(), "triptych-public-"));
  const issues = validatePageReferences(document, publicRoot);
  assert.ok(issues.some((issue) => issue.path.endsWith(".col1Img")));
  assert.equal(issues.some((issue) => issue.path.endsWith(".col2Img")), false);
  assert.equal(issues.some((issue) => issue.path.endsWith(".col3Img")), false);
});

test("current documents reject unknown props instead of normalizing them away", () => {
  assert.throws(
    () => parsePageDocument(createDocument([
      {
        props: { content: "Hello", id: "paragraph-1", unexpected: true },
        type: "RichParagraph",
      },
    ])),
    (error) => error instanceof PageDocumentValidationError &&
      error.issues.some((issue) => issue.path.endsWith("unexpected")),
  );
});

test("slot contracts reject unknown nested components", () => {
  assert.throws(
    () => parsePageDocument(createDocument([
      {
        props: {
          entries: [{ props: { id: "nested-1" }, type: "UnknownBlock" }],
          id: "works-list-1",
        },
        type: "WorksList",
      },
    ])),
    (error) => error instanceof PageDocumentValidationError &&
      error.issues.some((issue) => issue.path.includes("entries[0].type")),
  );
});

test("current documents reject dangerous links and duplicate component ids", () => {
  assert.throws(
    () => parsePageDocument(createDocument([
      {
        props: {
          buttonHref: "javascript:alert(1)",
          buttonLabel: "Open",
          description: "Description",
          eyebrow: "Next",
          id: "duplicate-id",
          title: "Title",
        },
        type: "HomeEndcapSection",
      },
      {
        props: { content: "Hello", id: "duplicate-id" },
        type: "RichParagraph",
      },
    ])),
    (error) => error instanceof PageDocumentValidationError &&
      error.issues.some((issue) => issue.message.includes("unsafe link")) &&
      error.issues.some((issue) => issue.message.includes("duplicates id")),
  );
});

test("future document versions are rejected without downgrade migration", () => {
  const future = { ...createDocument(), version: PAGE_DOCUMENT_VERSION + 1 };
  assert.throws(() => parsePageDocument(future), PageDocumentValidationError);
});

test("schema-invalid unversioned documents are not migrated into blank pages", () => {
  assert.throws(() => parsePageDocument({}), PageDocumentValidationError);
  assert.throws(
    () => parsePageDocument({ content: "bad", root: "bad" }),
    PageDocumentValidationError,
  );
});

test("current documents require every declared prop and canonical image settings", () => {
  const issues = validateCurrentPageDocument(createDocument([{
    props: {
      alt: "",
      caption: "",
      fitMode: "bad",
      id: "image-1",
      preset: "bad",
      src: "relative.jpg",
      variant: "content",
    },
    type: "ImagePanel",
  }]));

  assert.ok(issues.some((issue) => issue.path.endsWith(".fitMode")));
  assert.ok(issues.some((issue) => issue.path.endsWith(".preset")));
  assert.ok(issues.some((issue) => issue.path.endsWith(".src")));

  const missingPropIssues = validateCurrentPageDocument(createDocument([{
    props: { content: "Hello", id: "paragraph-1" },
    type: "StatementBlock",
  }]));
  assert.ok(missingPropIssues.some((issue) => issue.path.endsWith(".align")));
});

test("current documents strictly validate aliases and parameter records", () => {
  const document = migrateLegacyPageDocument({
    content: [
      {
        props: {
          aliases: [{ extra: true, slug: "Bad Alias" }],
          category: "Category",
          desc: "Description",
          href: "/works/example",
          imageSrc: "/images/train-station/2Day.webp",
          number: "01",
          title: "Example",
        },
        type: "WorksListEntry",
      },
      {
        props: {
          isVideo: false,
          mediaSrc: "/images/train-station/2Day.webp",
          parameters: [{ description: "Description", extra: true, name: "Name" }],
        },
        type: "ParameterGrid",
      },
    ],
    root: { props: { title: "Legacy" } },
    zones: {},
  });
  const issues = validateCurrentPageDocument(document);
  assert.ok(issues.some((issue) => issue.path.includes("aliases[0].extra")));
  assert.ok(issues.some((issue) => issue.path.includes("aliases[0].slug")));
  assert.ok(issues.some((issue) => issue.path.includes("parameters[0].extra")));
});

test("ContentRepository publishes only after validation and verifies the read-back", async () => {
  const publicRoot = fs.mkdtempSync(path.join(os.tmpdir(), "content-repository-public-"));
  const calls: string[] = [];
  let stored = createDocument() as JsonValue;
  const repository = new ContentRepository({
    listSlugs: async () => {
      calls.push("list");
      return ["about"];
    },
    publicRoot,
    readData: async () => {
      calls.push("read");
      return stored;
    },
    writeData: async (_slug, data) => {
      calls.push("write");
      stored = data;
    },
  });

  const result = await repository.publishPage("about", createDocument());
  assert.deepEqual(calls, ["write", "read", "list"]);
  assert.deepEqual(result, {
    ok: true,
    path: "about.json",
    slug: "about",
    slugs: ["about"],
  });
});

test("ContentRepository does not write invalid content", async () => {
  let writes = 0;
  const repository = new ContentRepository({
    listSlugs: async () => [],
    publicRoot: os.tmpdir(),
    readData: async () => createDocument() as JsonValue,
    writeData: async () => {
      writes += 1;
    },
  });

  await assert.rejects(
    repository.publishPage("about", createDocument([
      { props: { id: "unknown-1" }, type: "UnknownBlock" },
    ])),
    PageDocumentValidationError,
  );
  assert.equal(writes, 0);
});

test("ContentRepository validates the project catalog before writing works", async () => {
  let writes = 0;
  const duplicateCatalog = migrateLegacyPageDocument({
    content: [{
      props: {
        entries: [
          {
            props: {
              aliases: [], category: "A", desc: "A", href: "/works/same",
              imageFitMode: "x", imagePreset: "ratio-16-9",
              imageSrc: "/images/train-station/2Day.webp", number: "01", title: "A",
            },
            type: "WorksListEntry",
          },
          {
            props: {
              aliases: [], category: "B", desc: "B", href: "/works/same",
              imageFitMode: "x", imagePreset: "ratio-16-9",
              imageSrc: "/images/penguin/CyberRestaurant.webp", number: "02", title: "B",
            },
            type: "WorksListEntry",
          },
        ],
        heading: "Works",
        indexSummary: "Index",
      },
      type: "WorksList",
    }],
    root: { props: { title: "Works" } },
    zones: {},
  });
  const repository = new ContentRepository({
    listSlugs: async () => ["works", "works/same"],
    publicRoot: path.resolve(process.cwd(), "public"),
    readData: async () => duplicateCatalog as JsonValue,
    writeData: async () => {
      writes += 1;
    },
  });

  await assert.rejects(
    repository.publishPage("works", duplicateCatalog),
    PageDocumentValidationError,
  );
  assert.equal(writes, 0);
});

test("stored schema errors and failed read-back use repository error types", async () => {
  const invalidStoredRepository = new ContentRepository({
    readData: async () => ({ content: "bad" }) as unknown as JsonValue,
  });
  await assert.rejects(
    invalidStoredRepository.readPage("about"),
    StoredContentInvalidError,
  );

  const legacyStoredRepository = new ContentRepository({
    readData: async () => ({
      content: [],
      root: { props: { title: "Legacy" } },
      zones: {},
    }) as JsonValue,
  });
  await assert.rejects(
    legacyStoredRepository.readPage("about"),
    StoredContentInvalidError,
  );

  let reads = 0;
  const failedReadBackRepository = new ContentRepository({
    listSlugs: async () => ["about"],
    publicRoot: os.tmpdir(),
    readData: async () => {
      reads += 1;
      return { content: "bad" } as unknown as JsonValue;
    },
    writeData: async () => {},
  });
  await assert.rejects(
    failedReadBackRepository.publishPage("about", createDocument()),
    ContentPersistenceError,
  );
  assert.equal(reads, 1);
});
