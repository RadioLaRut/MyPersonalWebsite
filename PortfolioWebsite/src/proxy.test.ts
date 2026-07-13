import assert from "node:assert/strict";
import test from "node:test";

import { evaluateProxyPath } from "./lib/proxy-policy.ts";
import { resolveGeneratedWorkAlias } from "./puck/generated/work-alias-targets.ts";

test("proxy policy redirects legacy work aliases to canonical paths", () => {
  assert.deepEqual(evaluateProxyPath("/works/penguin-trading-company", resolveGeneratedWorkAlias), {
    kind: "redirect",
    pathname: "/works/penguin",
    status: 308,
  });
});

test("proxy policy permanently redirects the holy-tank alias", () => {
  assert.deepEqual(evaluateProxyPath("/works/holy-tank", resolveGeneratedWorkAlias), {
    kind: "redirect",
    pathname: "/works/wow-otto",
    status: 308,
  });
});

test("proxy policy preserves legacy public redirect status", () => {
  assert.deepEqual(evaluateProxyPath("/p/works/holy-tank", resolveGeneratedWorkAlias), {
    kind: "redirect",
    pathname: "/works/wow-otto",
    status: 307,
  });
});

test("proxy policy leaves canonical and unknown legal works paths to static routing", () => {
  assert.deepEqual(
    evaluateProxyPath("/works/penguin", resolveGeneratedWorkAlias),
    { kind: "next" },
  );
  assert.deepEqual(
    evaluateProxyPath("/works/not-real", resolveGeneratedWorkAlias),
    { kind: "next" },
  );
  assert.deepEqual(
    evaluateProxyPath("/p/works/not-real", resolveGeneratedWorkAlias),
    { kind: "redirect", pathname: "/works/not-real", status: 307 },
  );
});

test("proxy policy rejects invalid works paths before routing", () => {
  assert.deepEqual(
    evaluateProxyPath("/works/%ZZ", resolveGeneratedWorkAlias),
    { kind: "bad-request" },
  );
  assert.deepEqual(
    evaluateProxyPath("/p/%ZZ", resolveGeneratedWorkAlias),
    { kind: "bad-request" },
  );
});
