import assert from "node:assert/strict";
import test from "node:test";

import { resolveGeneratedWorkAlias } from "./generated/work-alias-targets.ts";
import { createWorkAliasResolverSource } from "./public-runtime-codegen.ts";

test("generated work alias resolver uses an own-property lookup", () => {
  const source = createWorkAliasResolverSource([
    { aliases: ["lighting"], id: "lighting-portfolio" },
  ]);

  assert.match(source, /Object\.hasOwn\(WORK_ALIAS_TARGETS, slug\)/u);
  assert.doesNotMatch(source, /WORK_ALIAS_TARGETS\[slug\] \?\?/u);
  assert.match(source, /"lighting": "lighting-portfolio"/u);
});

test("generated work alias resolver does not inherit object prototype names", () => {
  assert.equal(resolveGeneratedWorkAlias("constructor"), null);
  assert.equal(resolveGeneratedWorkAlias("toString"), null);
  assert.equal(resolveGeneratedWorkAlias("__proto__"), null);
  assert.equal(resolveGeneratedWorkAlias("holy-tank"), "wow-otto");
});
