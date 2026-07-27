import assert from "node:assert/strict";
import test from "node:test";

import {
  handleComponentDesignGet,
  handleComponentDesignPost,
  type ComponentDesignRepository,
} from "./component-design-api-handler.ts";
import { getComponentDesignRevision } from "./component-design-config.ts";
import {
  createDefaultComponentDesignDocument as createDefaultComponentDesignDocumentV2,
} from "./component-design-v2.ts";
import {
  createDefaultComponentDesignDocument,
} from "./component-design-v3.ts";
import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
  LOCAL_EDITOR_ACCESS_TOKENS_ENV,
} from "./local-editor-access.ts";
import { PRODUCTION_ENV_BLOCKLIST } from "./local-editor-policy.ts";

function withEditorEnvironment(callback: () => Promise<void>) {
  const environmentKeys = [
    "NEXT_PUBLIC_SITE_MODE",
    "NODE_ENV",
    LOCAL_EDITOR_ACCESS_TOKEN_ENV,
    LOCAL_EDITOR_ACCESS_TOKENS_ENV,
    ...PRODUCTION_ENV_BLOCKLIST,
  ] as const;
  const previous = new Map(
    environmentKeys.map((key) => [key, process.env[key]]),
  );

  process.env.NEXT_PUBLIC_SITE_MODE = "testing";
  Reflect.set(process.env, "NODE_ENV", "development");
  delete process.env[LOCAL_EDITOR_ACCESS_TOKEN_ENV];
  process.env[LOCAL_EDITOR_ACCESS_TOKENS_ENV] = "component-design-test-token";
  for (const key of PRODUCTION_ENV_BLOCKLIST) {
    Reflect.deleteProperty(process.env, key);
  }

  return callback().finally(() => {
    for (const [key, value] of previous) {
      if (value === undefined) Reflect.deleteProperty(process.env, key);
      else Reflect.set(process.env, key, value);
    }
  });
}

function postRequest(body: unknown) {
  return new Request("http://localhost/api/component-design", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      [LOCAL_EDITOR_ACCESS_HEADER]: "component-design-test-token",
    },
    method: "POST",
  });
}

function createRepository(
  overrides: Partial<ComponentDesignRepository> = {},
): ComponentDesignRepository {
  const document = createDefaultComponentDesignDocument();
  return {
    configPath: "/workspace/content/component-design/component-design.json",
    hasSaved: async () => true,
    read: async () => document,
    write: async () => undefined,
    ...overrides,
  };
}

test("ComponentDesign GET returns the current V3 source document and revision", async () => {
  await withEditorEnvironment(async () => {
    const document = createDefaultComponentDesignDocument();
    const response = await handleComponentDesignGet(
      new Request("http://localhost/api/component-design"),
      createRepository({ read: async () => document }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.config.version, 3);
    assert.equal(payload.revision, getComponentDesignRevision(document));
    assert.equal(response.headers.get("cache-control"), "no-store");
  });
});

test("ComponentDesign POST returns 409 and never writes over a newer revision", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    current.components.HeroSection.variants.poster.desktop.nodes.title.placement = {
      span: 8,
      start: 3,
    };
    const draft = createDefaultComponentDesignDocument();
    let writeCount = 0;
    const response = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(draft),
        config: draft,
      }),
      createRepository({
        read: async () => current,
        write: async () => {
          writeCount += 1;
        },
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 409);
    assert.equal(payload.error.code, "REVISION_CONFLICT");
    assert.equal(payload.revision, getComponentDesignRevision(current));
    assert.equal(writeCount, 0);
  });
});

test("ComponentDesign POST keeps whole-document compatibility and writes V3", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    const draft = structuredClone(current);
    draft.components.RichParagraph.variants.default.mobile.custom.nodes.body
      .placement = {
      span: 10,
      start: 2,
    };
    let written = current;
    const response = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(current),
        config: draft,
      }),
      createRepository({
        read: async () => current,
        write: async (document) => {
          written = document;
        },
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(written, draft);
    assert.equal(payload.revision, getComponentDesignRevision(draft));
  });
});

test("ComponentDesign POST merges only the requested variant patch", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    let written = current;
    const response = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(current),
        componentKey: "HeroSection",
        operationId: "drag-title-1",
        variantKey: "full",
        variantPatch: {
          desktop: {
            nodes: {
              title: {
                placement: {
                  span: 8,
                  start: 3,
                },
              },
            },
          },
          sampleText: {
            title: "新的 Lab 标题",
          },
        },
      }),
      createRepository({
        read: async () => current,
        write: async (document) => {
          written = document;
        },
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.operationId, "drag-title-1");
    assert.deepEqual(
      written.components.HeroSection.variants.full.desktop.nodes.title
        .placement,
      { span: 8, start: 3 },
    );
    assert.equal(
      written.components.HeroSection.variants.full.sampleText.title,
      "新的 Lab 标题",
    );
    assert.deepEqual(
      written.components.RichParagraph,
      current.components.RichParagraph,
    );
  });
});

test("ComponentDesign POST rejects a full V3 document that bypasses manifest capabilities", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    const draft = structuredClone(current);
    draft.components.HeroSection.variants.full.desktop.nodes.media.bleed =
      "none";
    let writeCount = 0;

    const response = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(current),
        config: draft,
      }),
      createRepository({
        read: async () => current,
        write: async () => {
          writeCount += 1;
        },
      }),
    );

    assert.equal(response.status, 400);
    assert.equal(writeCount, 0);
  });
});

test("ComponentDesign POST rejects a variant patch that bypasses manifest capabilities", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    let writeCount = 0;

    const response = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(current),
        componentKey: "ImagePanel",
        operationId: "invalid-media-bleed",
        variantKey: "content",
        variantPatch: {
          desktop: {
            nodes: {
              media: {
                bleed: "viewport",
              },
            },
          },
        },
      }),
      createRepository({
        read: async () => current,
        write: async () => {
          writeCount += 1;
        },
      }),
    );

    assert.equal(response.status, 400);
    assert.equal(writeCount, 0);
  });
});

test("ComponentDesign POST accepts a legacy V2 full document and persists V3", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    const legacyDraft = createDefaultComponentDesignDocumentV2();
    let written = current;
    const response = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(current),
        config: legacyDraft,
      }),
      createRepository({
        read: async () => current,
        write: async (document) => {
          written = document;
        },
      }),
    );

    assert.equal(response.status, 200);
    assert.equal(written.version, 3);
    assert.equal(
      written.components.HeroSection.variants.full.tablet.mode,
      "custom",
    );
  });
});

test("ComponentDesign POST rejects an invalid or unknown variant patch", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    let writeCount = 0;
    const invalidLayout = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(current),
        componentKey: "HeroSection",
        operationId: "invalid-offset",
        variantKey: "full",
        variantPatch: {
          desktop: {
            nodes: {
              title: {
                positioning: {
                  anchor: "center",
                  mode: "overlay",
                  offset: 7,
                },
              },
            },
          },
        },
      }),
      createRepository({
        read: async () => current,
        write: async () => {
          writeCount += 1;
        },
      }),
    );
    const unknownVariant = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(current),
        componentKey: "HeroSection",
        operationId: "unknown-variant",
        variantKey: "missing",
        variantPatch: {
          sampleText: {
            title: "不会写入",
          },
        },
      }),
      createRepository({
        read: async () => current,
        write: async () => {
          writeCount += 1;
        },
      }),
    );

    assert.equal(invalidLayout.status, 400);
    assert.equal(unknownVariant.status, 400);
    assert.equal(writeCount, 0);
  });
});

test("ComponentDesign POST reports persistence failure without returning a committed document", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    const response = await handleComponentDesignPost(
      postRequest({
        baseRevision: getComponentDesignRevision(current),
        config: current,
      }),
      createRepository({
        read: async () => current,
        write: async () => {
          throw new Error("disk unavailable");
        },
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.equal(payload.error.code, "INTERNAL_ERROR");
    assert.equal("config" in payload, false);
  });
});

test("ComponentDesign POST serializes concurrent revision checks and prevents last-write-wins", async () => {
  await withEditorEnvironment(async () => {
    let current = createDefaultComponentDesignDocument();
    const baseRevision = getComponentDesignRevision(current);
    let writeCount = 0;
    const repository = createRepository({
      read: async () => current,
      write: async (document) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        current = document;
        writeCount += 1;
      },
    });

    const responses = await Promise.all([
      handleComponentDesignPost(
        postRequest({
          baseRevision,
          componentKey: "HeroSection",
          operationId: "concurrent-hero",
          variantKey: "poster",
          variantPatch: {
            sampleText: { title: "第一个窗口" },
          },
        }),
        repository,
      ),
      handleComponentDesignPost(
        postRequest({
          baseRevision,
          componentKey: "RichParagraph",
          operationId: "concurrent-copy",
          variantKey: "default",
          variantPatch: {
            sampleText: { body: "第二个窗口" },
          },
        }),
        repository,
      ),
    ]);

    assert.deepEqual(
      responses.map((response) => response.status).sort(),
      [200, 409],
    );
    assert.equal(writeCount, 1);
  });
});
