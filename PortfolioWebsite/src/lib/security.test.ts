import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
} from "./local-editor-access.ts";
import {
  evaluateLocalEditorAccess,
  PRODUCTION_ENV_BLOCKLIST as BLOCKED_ENV_NAMES,
} from "./local-editor-policy.ts";

function setEnvValue(name: string, value: string | undefined) {
  const env = process.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[name];
  } else {
    env[name] = value;
  }
}

function withLocalEditorEnv(token: string | undefined, callback: () => void) {
  const previous = new Map<string, string | undefined>();
  for (const name of [
    "NODE_ENV",
    "NEXT_PUBLIC_SITE_MODE",
    LOCAL_EDITOR_ACCESS_TOKEN_ENV,
    ...BLOCKED_ENV_NAMES,
  ]) {
    previous.set(name, process.env[name]);
  }

  setEnvValue("NODE_ENV", "development");
  setEnvValue("NEXT_PUBLIC_SITE_MODE", "testing");
  for (const name of BLOCKED_ENV_NAMES) {
    setEnvValue(name, undefined);
  }

  setEnvValue(LOCAL_EDITOR_ACCESS_TOKEN_ENV, token);

  try {
    callback();
  } finally {
    for (const [name, value] of previous) {
      setEnvValue(name, value);
    }
  }
}

function requestWithToken(token?: string) {
  return new Request("http://localhost/api/puck", {
    headers: token ? { [LOCAL_EDITOR_ACCESS_HEADER]: token } : undefined,
  });
}

test("local editor read access preserves existing testing-mode behavior", () => {
  withLocalEditorEnv(undefined, () => {
    assert.equal(evaluateLocalEditorAccess(), "allowed");
  });
});

test("local editor writes require a configured token", () => {
  withLocalEditorEnv(undefined, () => {
    assert.equal(
      evaluateLocalEditorAccess(requestWithToken(), { requireToken: true }),
      "token-required",
    );
  });
});

test("local editor writes reject missing or mismatched token", () => {
  withLocalEditorEnv("expected-token", () => {
    assert.equal(
      evaluateLocalEditorAccess(requestWithToken(), { requireToken: true }),
      "token-required",
    );
    assert.equal(
      evaluateLocalEditorAccess(requestWithToken("wrong-token"), { requireToken: true }),
      "token-required",
    );
  });
});

test("local editor writes accept matching token", () => {
  withLocalEditorEnv("expected-token", () => {
    assert.equal(
      evaluateLocalEditorAccess(requestWithToken("expected-token"), { requireToken: true }),
      "allowed",
    );
  });
});
