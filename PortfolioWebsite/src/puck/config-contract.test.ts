import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { PUCK_COMPONENT_TYPES } from "./component-manifest.ts";

const CONFIG_FILES = [
  "consolidated-components.tsx",
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
  const serverSource = fs.readFileSync(
    path.join(process.cwd(), "src/components/works/WorksListEntry.tsx"),
    "utf8",
  );
  const islandSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/components/works/WorksListEntryActivation.tsx",
    ),
    "utf8",
  );

  assert.doesNotMatch(serverSource, /"use client"/);
  assert.doesNotMatch(serverSource, /<PresetImage/);
  assert.match(serverSource, /!editMode \? \(/);
  assert.match(serverSource, /imageSrc=\{imageSrc\}/);
  assert.match(islandSource, /hovered \|\| focused \|\| centered/);
  assert.match(islandSource, /hasActivated && imageSrc/);
  assert.match(islandSource, /<PresetImage/);
  assert.doesNotMatch(islandSource, /\beditMode\b/);
});

test("搜索收录是全站策略，不允许在单页设置中覆盖", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/puck/config.tsx"),
    "utf8",
  );

  assert.doesNotMatch(source, /label:\s*"搜索收录\|noIndex"/);
  assert.match(source, /noIndex:\s*true/);
});
