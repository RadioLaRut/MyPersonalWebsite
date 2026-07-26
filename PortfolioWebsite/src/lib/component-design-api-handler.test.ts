import assert from "node:assert/strict";
import test from "node:test";

import {
  handleComponentDesignGet,
  handleComponentDesignPost,
  type ComponentDesignRepository,
} from "./component-design-api-handler.ts";
import { getComponentDesignRevision } from "./component-design-config.ts";
import { createDefaultComponentDesignDocument } from "./component-design-v2.ts";
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

test("ComponentDesign GET returns the current V2 document and revision", async () => {
  await withEditorEnvironment(async () => {
    const document = createDefaultComponentDesignDocument();
    const response = await handleComponentDesignGet(
      new Request("http://localhost/api/component-design"),
      createRepository({ read: async () => document }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.config.version, 2);
    assert.equal(payload.revision, getComponentDesignRevision(document));
    assert.equal(response.headers.get("cache-control"), "no-store");
  });
});

test("ComponentDesign POST returns 409 and never writes over a newer revision", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    current.components.HeroSection.variants.poster.nodes.title.placement.desktop = {
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

test("ComponentDesign POST writes only a current V2 draft and returns its revision", async () => {
  await withEditorEnvironment(async () => {
    const current = createDefaultComponentDesignDocument();
    const draft = structuredClone(current);
    draft.components.RichParagraph.variants.default.nodes.body.placement.mobile = {
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
