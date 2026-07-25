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
  parseEditorPageDraft,
  parsePageDocument,
  stripPageEditorMetadata,
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

test("ThreeColumnSection images validate non-empty paths while preserving optional empty images", () => {
  const triptychProps = {
    col1Body: "One",
    col1BodyAlign: "left",
    col1Items: [],
    col1Label: "",
    col1MediaFitMode: "x",
    col1MediaPreset: "ratio-16-9",
    col1MediaSrc: "relative.webp",
    col1Subtitle: "",
    col1Title: "One",
    col2Body: "Two",
    col2BodyAlign: "left",
    col2Items: [],
    col2Label: "",
    col2MediaFitMode: "x",
    col2MediaPreset: "ratio-16-9",
    col2MediaSrc: "",
    col2Subtitle: "",
    col2Title: "Two",
    col3Body: "Three",
    col3BodyAlign: "left",
    col3Label: "",
    col3MediaFitMode: "x",
    col3MediaPreset: "ratio-16-9",
    col3MediaSrc: "",
    col3Subtitle: "",
    col3Title: "Three",
    id: "triptych-1",
    rhythm: "staggered",
    variant: "triptych",
  };
  assert.throws(
    () => parsePageDocument(createDocument([{
      props: triptychProps,
      type: "ThreeColumnSection",
    }])),
    (error) => error instanceof PageDocumentValidationError &&
      error.issues.some((issue) => issue.path.endsWith(".col1MediaSrc")),
  );

  const document = parsePageDocument(createDocument([{
    props: {
      ...triptychProps,
      col1MediaSrc: ["", "images", "definitely-missing.webp"].join("/"),
    },
    type: "ThreeColumnSection",
  }]));
  const publicRoot = fs.mkdtempSync(path.join(os.tmpdir(), "triptych-public-"));
  const issues = validatePageReferences(document, publicRoot);
  assert.ok(issues.some((issue) => issue.path.endsWith(".col1MediaSrc")));
  assert.equal(issues.some((issue) => issue.path.endsWith(".col2MediaSrc")), false);
  assert.equal(issues.some((issue) => issue.path.endsWith(".col3MediaSrc")), false);
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

test("DisplayName 可选、允许重复、规范化空白并限制为 80 字符", () => {
  const duplicateNames = createDocument([
    {
      props: {
        content: "First",
        align: "justify",
        editorDisplayName: "重复名称",
        id: "paragraph-1",
      },
      type: "RichParagraph",
    },
    {
      props: {
        content: "Second",
        align: "justify",
        editorDisplayName: "重复名称",
        id: "paragraph-2",
      },
      type: "RichParagraph",
    },
  ]);
  assert.deepEqual(validateCurrentPageDocument(duplicateNames), []);

  const normalized = parseEditorPageDraft(createDocument([
    {
      props: {
        content: "Trimmed",
        align: "justify",
        editorDisplayName: "  自定义名称  ",
        id: "paragraph-1",
      },
      type: "RichParagraph",
    },
    {
      props: {
        content: "Empty",
        align: "justify",
        editorDisplayName: "   ",
        id: "paragraph-2",
      },
      type: "RichParagraph",
    },
  ]));
  assert.equal(normalized.content[0].props.editorDisplayName, "自定义名称");
  assert.equal("editorDisplayName" in normalized.content[1].props, false);

  const issues = validateCurrentPageDocument(createDocument([
    {
      props: {
        content: "Too long",
        align: "justify",
        editorDisplayName: "名".repeat(81),
        id: "paragraph-1",
      },
      type: "RichParagraph",
    },
  ]));
  assert.ok(issues.some((issue) => (
    issue.path.endsWith(".editorDisplayName") &&
    issue.message.includes("80")
  )));
});

test("公开渲染前递归剥离根内容、Slot 和旧 zone 中的 DisplayName", () => {
  const stripped = stripPageEditorMetadata({
    content: [
      {
        props: {
          editorDisplayName: "父级",
          entries: [
            {
              props: {
                editorDisplayName: "子级",
                id: "entry-1",
              },
              type: "WorksListEntry",
            },
          ],
          id: "works-list-1",
        },
        type: "WorksList",
      },
    ],
    zones: {
      "legacy:zone": [
        {
          props: {
            editorDisplayName: "旧节点",
            id: "legacy-1",
          },
          type: "RichParagraph",
        },
      ],
    },
  });

  assert.equal(
    "editorDisplayName" in stripped.content[0].props,
    false,
  );
  const entry = stripped.content[0].props.entries[0];
  assert.equal("editorDisplayName" in entry.props, false);
  assert.equal(
    "editorDisplayName" in stripped.zones["legacy:zone"][0].props,
    false,
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

test("BilibiliEmbed contract accepts only canonical sources and alignment enums", () => {
  const valid = createDocument([{
    props: {
      caption: "项目演示",
      captionAlign: "justify",
      id: "bilibili-1",
      source: "https://www.bilibili.com/video/BV1DNwUeDEos?p=2&t=30",
      title: "项目演示视频",
    },
    type: "BilibiliEmbed",
  }]);
  assert.deepEqual(validateCurrentPageDocument(valid), []);

  const issues = validateCurrentPageDocument(createDocument([{
    props: {
      caption: "",
      captionAlign: "fill",
      id: "bilibili-1",
      source: "https://example.com/video/BV1DNwUeDEos",
      title: " ",
    },
    type: "BilibiliEmbed",
  }]));
  assert.ok(issues.some((issue) => issue.path.endsWith(".captionAlign")));
  assert.ok(issues.some((issue) => issue.path.endsWith(".source")));
  assert.ok(issues.some((issue) => issue.path.endsWith(".title")));
});

test("current documents accept safe Unicode image names and reject non-relative media paths", () => {
  const imageProps = {
    alt: "",
    caption: "",
    captionAlign: "left",
    fitMode: "x",
    id: "image-unicode",
    preset: "ratio-16-9",
    src: "/images/covers/2025/作品集封面.webp",
    variant: "content",
  };
  assert.deepEqual(
    validateCurrentPageDocument(createDocument([{
      props: imageProps,
      type: "ImagePanel",
    }])),
    [],
  );

  for (const invalidPath of [
    "/Users/baixi/Pictures/image.webp",
    "file:///images/image.webp",
    "https://example.com/image.webp",
    ["", "images", "..", "secret.webp"].join("/"),
    ["", "images", "folder\\image.webp"].join("/"),
  ]) {
    const issues = validateCurrentPageDocument(createDocument([{
      props: { ...imageProps, src: invalidPath },
      type: "ImagePanel",
    }]));
    assert.ok(
      issues.some((issue) => issue.path.endsWith(".src")),
      invalidPath,
    );
  }
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
