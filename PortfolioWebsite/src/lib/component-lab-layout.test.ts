import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const componentLabSource = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "src/components/playground/ComponentLabClient.tsx",
  ),
  "utf8",
);

test("ComponentLab uses a top context selector instead of a component catalog", () => {
  assert.doesNotMatch(componentLabSource, /type="search"/);
  assert.doesNotMatch(componentLabSource, /filteredComponentKeys/);
  assert.doesNotMatch(componentLabSource, /grid-cols-2 gap-2/);

  const contextStart = componentLabSource.indexOf(
    'data-component-lab-region="context"',
  );
  const settingsStart = componentLabSource.indexOf(
    'data-component-lab-region="settings"',
  );

  assert.notEqual(contextStart, -1);
  assert.notEqual(settingsStart, -1);
  assert.ok(contextStart < settingsStart);

  const contextSource = componentLabSource.slice(contextStart, settingsStart);
  assert.match(contextSource, /value=\{selectedComponent\}/);
  assert.match(contextSource, /options=\{componentOptions\}/);
  assert.match(contextSource, /value=\{selectedInstance\.id\}/);
  assert.match(contextSource, /options=\{instanceOptions\}/);
  assert.match(contextSource, /\{selectedInstanceSource\}/);
});

test("ComponentLab settings and canvas are peer desktop workspaces", () => {
  const settingsStart = componentLabSource.indexOf(
    'data-component-lab-region="settings"',
  );
  const canvasStart = componentLabSource.indexOf(
    'data-component-lab-region="canvas"',
  );

  assert.notEqual(settingsStart, -1);
  assert.notEqual(canvasStart, -1);
  assert.ok(settingsStart < canvasStart);

  const settingsSource = componentLabSource.slice(settingsStart, canvasStart);
  const canvasSource = componentLabSource.slice(canvasStart);

  assert.match(settingsSource, /lg:col-span-4/);
  assert.match(settingsSource, /COMPONENT SETTINGS/);
  assert.match(settingsSource, /overflow-y-auto/);
  assert.match(canvasSource, /lg:col-span-8/);
  assert.match(canvasSource, /LIVE CANVAS/);
  assert.match(canvasSource, /previewFrameRef/);
});
