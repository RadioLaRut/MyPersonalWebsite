import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { COMPONENT_DESIGN_COMPONENT_KEYS } from "./component-design-schema.ts";

test("ComponentLab controls only write to their own component design scope", () => {
  const registryPath = path.resolve(
    process.cwd(),
    "src/components/playground/component-lab-registry.tsx",
  );
  const source = fs.readFileSync(registryPath, "utf8");
  const registryStart = source.indexOf("export const COMPONENT_LAB_REGISTRY");
  assert.notEqual(registryStart, -1);
  const registrySource = source.slice(registryStart);

  const starts = COMPONENT_DESIGN_COMPONENT_KEYS.map((key) => ({
    key,
    index: registrySource.indexOf(`\n  ${key}: {`),
  })).filter((entry) => entry.index >= 0);

  for (const entry of starts) {
    const nextStart = Math.min(
      ...starts
        .map((candidate) => candidate.index)
        .filter((candidateIndex) => candidateIndex > entry.index),
      registrySource.length,
    );
    const componentSource = registrySource.slice(entry.index, nextStart);
    const referencedScopes = [...componentSource.matchAll(/document\.components\.([A-Za-z0-9]+)/g)]
      .map((match) => match[1]);

    assert.deepEqual(
      [...new Set(referencedScopes)],
      referencedScopes.length > 0 ? [entry.key] : [],
      `${entry.key} 不得读写其他组件的设计配置`,
    );
  }
});
