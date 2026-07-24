import assert from "node:assert/strict";
import test from "node:test";

import {
  ContentNotFoundError,
  ContentPersistenceError,
  StoredContentInvalidError,
} from "./content-repository.ts";
import {
  ContentBudgetExceededError,
  ContentQuotaExceededError,
} from "./content-budget.ts";
import { PageDocumentValidationError, type PageDocument } from "./page-document-contract.ts";
import { handlePuckGet, handlePuckPost } from "./puck-api-handler.ts";

const validDocument = {
  content: [],
  root: {
    props: {
      description: "Description",
      image: "",
      noIndex: false,
      title: "Title",
    },
  },
  version: 1,
  zones: {},
} as PageDocument;

function createRepository(overrides: Record<string, unknown> = {}) {
  return {
    listPageSlugs: async () => ["index"],
    publishPage: async () => ({
      ok: true as const,
      path: "index.json",
      slug: "index",
      slugs: ["index"],
    }),
    readPage: async () => validDocument,
    readProjectCatalog: async () => {
      throw new Error("not used");
    },
    ...overrides,
  };
}

function withEditorEnvironment(callback: () => Promise<void>) {
  const previous = {
    ci: process.env.CI,
    mode: process.env.NEXT_PUBLIC_SITE_MODE,
    nodeEnv: process.env.NODE_ENV,
    token: process.env.LOCAL_EDITOR_ACCESS_TOKEN,
    vercel: process.env.VERCEL,
  };
  process.env.NEXT_PUBLIC_SITE_MODE = "testing";
  Reflect.set(process.env, "NODE_ENV", "development");
  process.env.LOCAL_EDITOR_ACCESS_TOKEN = "test-token";
  delete process.env.CI;
  delete process.env.VERCEL;

  return callback().finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      const environmentKey = {
        ci: "CI",
        mode: "NEXT_PUBLIC_SITE_MODE",
        nodeEnv: "NODE_ENV",
        token: "LOCAL_EDITOR_ACCESS_TOKEN",
        vercel: "VERCEL",
      }[key] as string;
      if (value === undefined) Reflect.deleteProperty(process.env, environmentKey);
      else Reflect.set(process.env, environmentKey, value);
    }
  });
}

function postRequest(body: BodyInit, includeToken = true) {
  return new Request("http://localhost/api/puck", {
    body,
    headers: {
      "Content-Type": "application/json",
      ...(includeToken ? { "x-local-editor-token": "test-token" } : {}),
    },
    method: "POST",
  });
}

test("Puck handler denies normal mode and lists pages in local testing mode", async () => {
  process.env.NEXT_PUBLIC_SITE_MODE = "normal";
  const denied = await handlePuckGet(
    new Request("http://localhost/api/puck?list=1"),
    createRepository(),
  );
  assert.equal(denied.status, 403);

  await withEditorEnvironment(async () => {
    const response = await handlePuckGet(
      new Request("http://localhost/api/puck?list=1"),
      createRepository(),
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { slugs: ["index"] });
  });
});

test("Puck POST requires a token and rejects invalid JSON", async () => {
  await withEditorEnvironment(async () => {
    const denied = await handlePuckPost(
      postRequest("{}", false),
      createRepository(),
    );
    assert.equal(denied.status, 403);

    const badJson = await handlePuckPost(
      postRequest("{"),
      createRepository(),
    );
    assert.equal(badJson.status, 400);
    assert.equal((await badJson.json()).error.code, "BAD_REQUEST");
  });
});

test("Puck POST preserves 422 issues and distinguishes persistence failures", async () => {
  await withEditorEnvironment(async () => {
    const invalid = await handlePuckPost(
      postRequest(JSON.stringify({ data: validDocument, slug: "" })),
      createRepository({
        publishPage: async () => {
          throw new PageDocumentValidationError([{
            message: "unknown component",
            path: "$.content[0].type",
          }]);
        },
      }),
    );
    assert.equal(invalid.status, 422);
    const invalidBody = await invalid.json();
    assert.equal(invalidBody.error.code, "INVALID_CONTENT");
    assert.equal(invalidBody.error.issues[0].path, "$.content[0].type");

    const failed = await handlePuckPost(
      postRequest(JSON.stringify({ data: validDocument, slug: "" })),
      createRepository({
        publishPage: async () => {
          throw new ContentPersistenceError("read-back failed");
        },
      }),
    );
    assert.equal(failed.status, 500);
    assert.equal((await failed.json()).error.code, "CONTENT_PERSISTENCE_ERROR");

    const overBudget = await handlePuckPost(
      postRequest(JSON.stringify({ data: validDocument, slug: "" })),
      createRepository({
        publishPage: async () => {
          throw new ContentBudgetExceededError("test budget");
        },
      }),
    );
    assert.equal(overBudget.status, 422);
    assert.equal((await overBudget.json()).error.code, "CONTENT_BUDGET_EXCEEDED");

    const overQuota = await handlePuckPost(
      postRequest(JSON.stringify({ data: validDocument, slug: "" })),
      createRepository({
        publishPage: async () => {
          throw new ContentQuotaExceededError("test quota");
        },
      }),
    );
    assert.equal(overQuota.status, 507);
    assert.equal((await overQuota.json()).error.code, "CONTENT_QUOTA_EXCEEDED");
  });
});

test("Puck GET distinguishes missing and corrupt stored content", async () => {
  await withEditorEnvironment(async () => {
    const missing = await handlePuckGet(
      new Request("http://localhost/api/puck?slug=about"),
      createRepository({
        readPage: async () => {
          throw new ContentNotFoundError("about");
        },
      }),
    );
    assert.equal(missing.status, 404);

    const corrupt = await handlePuckGet(
      new Request("http://localhost/api/puck?slug=about"),
      createRepository({
        readPage: async () => {
          throw new StoredContentInvalidError("about");
        },
      }),
    );
    assert.equal(corrupt.status, 500);
    assert.equal((await corrupt.json()).error.code, "INVALID_STORED_CONTENT");
  });
});
