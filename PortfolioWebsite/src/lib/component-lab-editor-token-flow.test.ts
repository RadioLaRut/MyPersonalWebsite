import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { isComponentLabEditorTokenRequired } from "./component-lab-save-auth.ts";

const root = process.cwd();
const clientSource = readFileSync(
  path.join(root, "src/components/playground/ComponentLabClient.tsx"),
  "utf8",
);
const dialogSource = readFileSync(
  path.join(
    root,
    "src/components/playground/component-lab/ComponentLabTokenDialog.tsx",
  ),
  "utf8",
);
const toolbarSource = readFileSync(
  path.join(
    root,
    "src/components/playground/component-lab/ComponentLabToolbar.tsx",
  ),
  "utf8",
);

test("ComponentLab 保留结构化 Token 缺失信号并暂停原保存队列", () => {
  assert.equal(isComponentLabEditorTokenRequired({
    error: {
      code: "EDITOR_TOKEN_REQUIRED",
      message: "Set a local editor token",
    },
  }), true);
  assert.equal(isComponentLabEditorTokenRequired({
    error: {
      code: "BAD_REQUEST",
      message: "Invalid payload",
    },
  }), false);
  assert.equal(isComponentLabEditorTokenRequired(null), false);
  assert.match(
    clientSource,
    /isComponentLabEditorTokenRequired\(payload\)/,
  );
  assert.match(
    clientSource,
    /editorTokenRequiredRef\.current \|\|\s*saveQueueRef\.current\.length === 0/,
  );
  assert.match(
    clientSource,
    /editorTokenRequiredRef\.current = true;[\s\S]*?setShowEditorTokenDialog\(true\);[\s\S]*?continueImmediately = false;[\s\S]*?return;/,
  );
  assert.match(
    clientSource,
    /当前浏览器的 Token 与 \.env\.local 不匹配，请重新输入。/,
  );
});

test("ComponentLab Token 只写入现有本机存储入口并立即重试保留队列", () => {
  assert.match(clientSource, /setLocalEditorAccessToken\(token\)/);
  assert.match(
    clientSource,
    /editorTokenRequiredRef\.current = false;[\s\S]*?setShowEditorTokenDialog\(false\);[\s\S]*?setSaveState\("saving"\);[\s\S]*?queueMicrotask\(\(\) => processSaveQueueRef\.current\(\)\)/,
  );
  assert.match(
    clientSource,
    /onSaveErrorClick=\{editorTokenRequired[\s\S]*?setShowEditorTokenDialog\(true\)/,
  );
});

test("ComponentLab 使用独立密码对话框且不耦合 Puck 对话框样式", () => {
  assert.match(dialogSource, /role="dialog"/);
  assert.match(dialogSource, /type="password"/);
  assert.match(dialogSource, /设置本机编辑 Token/);
  assert.match(dialogSource, /不会写入页面内容或 Git/);
  assert.doesNotMatch(dialogSource, /@\/puck|editor-dialogs|\.module\.css/);
});

test("工具栏仍只显示保存状态，并仅在 Token 错误时提供点击入口", () => {
  assert.match(toolbarSource, /onSaveErrorClick\?: \(\) => void/);
  assert.match(toolbarSource, /disabled=\{!onSaveErrorClick\}/);
  assert.match(toolbarSource, /<span role="status">\{saveLabel\}<\/span>/);
  assert.match(toolbarSource, /保存失败，设置本机编辑 Token/);
});
