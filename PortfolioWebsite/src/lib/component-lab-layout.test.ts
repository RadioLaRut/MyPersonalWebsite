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
const componentLabPickerSource = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "src/components/playground/component-lab/ComponentVariantPicker.tsx",
  ),
  "utf8",
);
const componentLabInspectorSource = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "src/components/playground/component-lab/ComponentLabInspector.tsx",
  ),
  "utf8",
);
const componentLabToolbarSource = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "src/components/playground/component-lab/ComponentLabToolbar.tsx",
  ),
  "utf8",
);
const componentLabUiSource = [
  componentLabSource,
  componentLabPickerSource,
  componentLabInspectorSource,
  componentLabToolbarSource,
].join("\n");

test("ComponentLab 使用组件版式联合搜索与三栏工作台", () => {
  assert.match(componentLabPickerSource, /type="search"/);
  assert.match(componentLabPickerSource, /组件与版式/);
  assert.doesNotMatch(componentLabUiSource, /label="作者组件"/);
  assert.doesNotMatch(componentLabUiSource, /label="真实内容实例"/);
  assert.doesNotMatch(componentLabUiSource, /label="结构变体"/);

  const navigationStart = componentLabSource.indexOf(
    'data-component-lab-region="navigation"',
  );
  const canvasStart = componentLabSource.indexOf(
    'data-component-lab-region="canvas"',
  );
  const inspectorStart = componentLabSource.indexOf("<ComponentLabInspector");

  assert.notEqual(navigationStart, -1);
  assert.notEqual(inspectorStart, -1);
  assert.match(
    componentLabInspectorSource,
    /data-component-lab-region="inspector"/,
  );
  assert.notEqual(canvasStart, -1);
  assert.ok(navigationStart < canvasStart);
  assert.ok(canvasStart < inspectorStart);
  assert.match(componentLabSource, /grid-cols-\[260px_minmax\(0,1fr\)_300px\]/);
});

test("ComponentLab 使用自动保存、设备继承与会话撤销", () => {
  assert.match(componentLabToolbarSource, /保存中/);
  assert.match(componentLabToolbarSource, /已保存/);
  assert.match(componentLabToolbarSource, /保存失败/);
  assert.doesNotMatch(componentLabUiSource, /保存全部更改/);
  assert.match(componentLabInspectorSource, /跟随桌面/);
  assert.match(componentLabInspectorSource, /单独调整/);
  assert.match(componentLabInspectorSource, /恢复跟随桌面/);
  assert.match(componentLabToolbarSource, /撤销/);
  assert.match(componentLabToolbarSource, /重做/);
  assert.match(componentLabUiSource, /component-lab-scroll/);
  assert.match(componentLabSource, /previewFrameRef/);
  assert.match(componentLabSource, /saveRunningRef\.current/);
  assert.match(componentLabSource, /saveQueueRef\.current\[0\]/);
  assert.match(componentLabSource, /SAVE_RETRY_DELAY_MS/);
  assert.match(componentLabSource, /baseRevision/);
  assert.match(componentLabSource, /保留本地修改/);
  assert.match(componentLabSource, /加载最新版本/);
});
