import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { PUCK_COMPONENT_TYPES } from "./component-manifest.ts";

const CONFIG_FILES = [
  "layout-components.tsx",
  "works-components.tsx",
  "lighting-components.tsx",
  "contact-common-components.tsx",
];

test("Admin 配置只定义字段与默认值，不维护第二套渲染器", () => {
  const configRoot = path.join(process.cwd(), "src/puck/config");
  const source = CONFIG_FILES.map((file) =>
    fs.readFileSync(path.join(configRoot, file), "utf8")
  ).join("\n");

  assert.doesNotMatch(source, /\brender\s*:/);
  assert.doesNotMatch(source, /contentEditable\s*:\s*true/);
  assert.match(source, /title:\s*\{\s*type:\s*"textarea",\s*label:\s*"Title"\s*\}/);
});

test("唯一渲染器清单与 Puck manifest 完全一致", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/puck/canonical-renderers.ts"),
    "utf8",
  );
  for (const type of PUCK_COMPONENT_TYPES) {
    assert.match(source, new RegExp(`\\n  ${type}: render`));
  }
});

test("编辑态只禁用 WorksListEntry 交互，不强制视觉激活", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/components/works/WorksListEntry.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /const active = isHovered \|\| isFocused \|\| isInsideCenterZone;/,
  );
  assert.doesNotMatch(source, /const active = editMode/);
});
