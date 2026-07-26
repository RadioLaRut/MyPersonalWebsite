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

test("ComponentLab uses direct component, instance, variant, and node controls", () => {
  assert.doesNotMatch(componentLabSource, /type="search"/);
  assert.doesNotMatch(componentLabSource, /filteredComponentKeys/);

  const inspectorStart = componentLabSource.indexOf(
    'data-component-lab-region="inspector"',
  );
  const canvasStart = componentLabSource.indexOf(
    'data-component-lab-region="canvas"',
  );

  assert.notEqual(inspectorStart, -1);
  assert.notEqual(canvasStart, -1);
  assert.ok(inspectorStart < canvasStart);

  const inspectorSource = componentLabSource.slice(inspectorStart, canvasStart);
  assert.match(inspectorSource, /label="作者组件"/);
  assert.match(inspectorSource, /label="真实内容实例"/);
  assert.match(inspectorSource, /label="结构变体"/);
  assert.match(inspectorSource, /<NodeInspector/);
});

test("ComponentLab inspector and canonical canvas are peer 4/8 desktop workspaces", () => {
  const inspectorStart = componentLabSource.indexOf(
    'data-component-lab-region="inspector"',
  );
  const canvasStart = componentLabSource.indexOf(
    'data-component-lab-region="canvas"',
  );

  assert.notEqual(inspectorStart, -1);
  assert.notEqual(canvasStart, -1);
  assert.ok(inspectorStart < canvasStart);

  const inspectorSource = componentLabSource.slice(inspectorStart, canvasStart);
  const canvasSource = componentLabSource.slice(canvasStart);

  assert.match(componentLabSource, /lg:col-span-4/);
  assert.match(inspectorSource, /overflow-y-auto/);
  assert.match(inspectorSource, /保存全部更改/);
  assert.match(componentLabSource, /lg:col-span-8/);
  assert.match(canvasSource, /CANONICAL RENDERER/);
  assert.match(canvasSource, /previewFrameRef/);
});
