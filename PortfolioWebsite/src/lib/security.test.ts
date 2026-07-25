import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
  LOCAL_EDITOR_ACCESS_TOKENS_ENV,
} from "./local-editor-access.ts";
import {
  createApiLocalEditorTransportContext,
  createLocalEditorTransportContext,
  evaluateLocalEditorAccess,
  evaluateLocalEditorApiAccess,
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

type LocalEditorTokenEnvironment = {
  legacyToken?: string;
  tokens?: string;
};

function withLocalEditorEnv(
  tokenEnvironment: LocalEditorTokenEnvironment,
  callback: () => void,
) {
  const previous = new Map<string, string | undefined>();
  for (const name of [
    "NODE_ENV",
    "NEXT_PUBLIC_SITE_MODE",
    LOCAL_EDITOR_ACCESS_TOKEN_ENV,
    LOCAL_EDITOR_ACCESS_TOKENS_ENV,
    ...BLOCKED_ENV_NAMES,
  ]) {
    previous.set(name, process.env[name]);
  }

  setEnvValue("NODE_ENV", "development");
  setEnvValue("NEXT_PUBLIC_SITE_MODE", "testing");
  for (const name of BLOCKED_ENV_NAMES) {
    setEnvValue(name, undefined);
  }

  setEnvValue(LOCAL_EDITOR_ACCESS_TOKEN_ENV, tokenEnvironment.legacyToken);
  setEnvValue(LOCAL_EDITOR_ACCESS_TOKENS_ENV, tokenEnvironment.tokens);

  try {
    callback();
  } finally {
    for (const [name, value] of previous) {
      setEnvValue(name, value);
    }
  }
}

function localRequest(
  token?: string,
  init: { host?: string; origin?: string; forwardedHost?: string } = {},
) {
  const headers = new Headers();
  if (token) headers.set(LOCAL_EDITOR_ACCESS_HEADER, token);
  if (init.host) headers.set("host", init.host);
  if (init.origin) headers.set("origin", init.origin);
  if (init.forwardedHost) headers.set("x-forwarded-host", init.forwardedHost);
  return new Request("http://localhost:3000/api/puck", { headers });
}

test("page transport accepts only exact loopback authorities", () => {
  for (const authority of [
    "127.0.0.1",
    "127.0.0.1:3000",
    "localhost",
    "LOCALHOST:3000",
    "[::1]",
    "[::1]:3000",
  ]) {
    assert.ok(createLocalEditorTransportContext(authority));
  }

  for (const authority of [
    "",
    "localhost.",
    "localhost.example",
    "127.0.0.2",
    "0.0.0.0",
    "::",
    "192.168.1.10",
    "user@localhost",
    "localhost/path",
    "localhost,example.test",
    "localhost:0",
    "localhost:65536",
  ]) {
    assert.equal(createLocalEditorTransportContext(authority), null);
  }
});

test("page Origin is optional but must be loopback and authority-matched when present", () => {
  assert.deepEqual(createLocalEditorTransportContext("localhost:3000"), {
    authority: "localhost:3000",
  });
  assert.deepEqual(
    createLocalEditorTransportContext("localhost:3000", "http://localhost:3000"),
    { authority: "localhost:3000", origin: "http://localhost:3000" },
  );
  assert.deepEqual(
    createLocalEditorTransportContext("localhost:80", "http://localhost"),
    { authority: "localhost:80", origin: "http://localhost" },
  );

  for (const origin of [
    "ftp://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://localhost.example:3000",
    "http://user@localhost:3000",
    "http://localhost:3000/path",
    "http://localhost:3000,https://localhost:3000",
  ]) {
    assert.equal(createLocalEditorTransportContext("localhost:3000", origin), null);
  }
});

test("API authority accepts equivalent loopback aliases on the same port", () => {
  assert.deepEqual(
    createApiLocalEditorTransportContext(localRequest(undefined, {
      host: "localhost:3000",
    })),
    { authority: "localhost:3000" },
  );
  assert.deepEqual(
    createApiLocalEditorTransportContext(localRequest(undefined, {
      host: "127.0.0.1:3000",
    })),
    { authority: "127.0.0.1:3000" },
  );
  assert.equal(
    createApiLocalEditorTransportContext(localRequest(undefined, {
      host: "127.0.0.1:3001",
    })),
    null,
  );
});

test("API Origin must match the actual Host and request protocol", () => {
  assert.ok(
    createApiLocalEditorTransportContext(localRequest(undefined, {
      origin: "http://localhost:3000",
    })),
  );
  assert.ok(
    createApiLocalEditorTransportContext(localRequest(undefined, {
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
    })),
  );
  assert.equal(
    createApiLocalEditorTransportContext(localRequest(undefined, {
      host: "127.0.0.1:3000",
      origin: "http://localhost:3000",
    })),
    null,
  );
  assert.equal(
    createApiLocalEditorTransportContext(localRequest(undefined, {
      origin: "https://localhost:3000",
    })),
    null,
  );
  assert.equal(
    createApiLocalEditorTransportContext(localRequest(undefined, {
      origin: "http://localhost:3001",
    })),
    null,
  );
});

test("page and API guards derive the same context from the actual transport headers", () => {
  const pageContext = createLocalEditorTransportContext(
    "127.0.0.1:3000",
    "http://127.0.0.1:3000",
  );
  const apiContext = createApiLocalEditorTransportContext(localRequest(undefined, {
    host: "127.0.0.1:3000",
    origin: "http://127.0.0.1:3000",
  }));

  assert.deepEqual(apiContext, pageContext);
});

test("forwarded source headers are ignored", () => {
  const request = localRequest(undefined, {
    forwardedHost: "example.test",
    host: "localhost:3000",
  });
  assert.deepEqual(createApiLocalEditorTransportContext(request), {
    authority: "localhost:3000",
  });
});

test("local editor reads require a valid transport context", () => {
  withLocalEditorEnv({}, () => {
    assert.equal(
      evaluateLocalEditorAccess(createLocalEditorTransportContext("localhost:3000")),
      "allowed",
    );
    assert.equal(evaluateLocalEditorAccess(null), "unauthorized");
  });
});

test("local editor writes require a configured, matching token", () => {
  withLocalEditorEnv({}, () => {
    assert.equal(
      evaluateLocalEditorApiAccess(localRequest(), { requireToken: true }),
      "token-required",
    );
  });

  withLocalEditorEnv({ legacyToken: "expected-token" }, () => {
    assert.equal(
      evaluateLocalEditorApiAccess(localRequest(), { requireToken: true }),
      "token-required",
    );
    assert.equal(
      evaluateLocalEditorApiAccess(localRequest("wrong-token"), { requireToken: true }),
      "token-required",
    );
    assert.equal(
      evaluateLocalEditorApiAccess(localRequest("expected-token"), { requireToken: true }),
      "allowed",
    );
  });
});

test("local editor writes accept every configured computer token", () => {
  withLocalEditorEnv({
    legacyToken: "legacy-token",
    tokens: [
      " computer-a-token",
      "computer-b-token",
      "",
      "computer-c-token",
      "computer-b-token ",
    ].join(",\n"),
  }, () => {
    for (const token of [
      "legacy-token",
      "computer-a-token",
      "computer-b-token",
      "computer-c-token",
    ]) {
      assert.equal(
        evaluateLocalEditorApiAccess(localRequest(token), { requireToken: true }),
        "allowed",
      );
    }

    for (const token of [
      "wrong-token",
      "computer-a-token,computer-b-token",
    ]) {
      assert.equal(
        evaluateLocalEditorApiAccess(localRequest(token), { requireToken: true }),
        "token-required",
      );
    }
  });
});

test("source rejection precedes token validation", () => {
  withLocalEditorEnv({ legacyToken: "expected-token" }, () => {
    for (const request of [
      new Request("http://example.test/api/puck", {
        headers: { [LOCAL_EDITOR_ACCESS_HEADER]: "expected-token" },
      }),
      localRequest("expected-token", { host: "example.test" }),
      localRequest("expected-token", { origin: "http://example.test" }),
    ]) {
      assert.equal(
        evaluateLocalEditorApiAccess(request, { requireToken: true }),
        "unauthorized",
      );
    }
  });
});

test("production and hosted environments remain closed", () => {
  withLocalEditorEnv({}, () => {
    const context = createLocalEditorTransportContext("localhost:3000");
    assert.ok(context);

    const previousNodeEnv = process.env.NODE_ENV;
    setEnvValue("NODE_ENV", "production");
    assert.equal(evaluateLocalEditorAccess(context), "unauthorized");
    setEnvValue("NODE_ENV", previousNodeEnv);

    for (const name of BLOCKED_ENV_NAMES) {
      const previous = process.env[name];
      setEnvValue(name, "1");
      assert.equal(evaluateLocalEditorAccess(context), "unauthorized");
      setEnvValue(name, previous);
    }
  });
});
