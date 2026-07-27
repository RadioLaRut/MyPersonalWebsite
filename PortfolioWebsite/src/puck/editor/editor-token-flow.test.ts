import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  getApiSaveErrorMessage,
  isEditorTokenRequired,
} from "./save-status.ts";

const editorClientSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor-client.tsx"),
  "utf8",
);
const editorDialogsSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor/editor-dialogs.tsx"),
  "utf8",
);

const tokenRequiredPayload = {
  error: {
    code: "EDITOR_TOKEN_REQUIRED",
    message: "Set a local editor token",
  },
};

test("editor token failures retain a structured signal for the setup flow", () => {
  assert.equal(isEditorTokenRequired(tokenRequiredPayload), true);
  assert.equal(isEditorTokenRequired({
    error: { code: "INVALID_CONTENT", message: "Invalid content" },
  }), false);
  assert.match(
    getApiSaveErrorMessage(tokenRequiredPayload, 403),
    /Token 缺失.*允许的 Token 列表/,
  );
});

test("editor offers a masked token setup dialog and retries through the normal save path", () => {
  assert.match(editorDialogsSource, /title="设置本机编辑 Token"/);
  assert.match(editorDialogsSource, /type="password"/);
  assert.match(editorDialogsSource, /不会写入页面内容或 Git/);
  assert.match(editorClientSource, /setLocalEditorAccessToken\(token\)/);
  assert.match(
    editorClientSource,
    /tokenRequired && trigger === "manual"[\s\S]*?setShowEditorTokenDialog\(true\)/,
  );
  assert.match(
    editorClientSource,
    /editorTokenRequired \? "设置 Token" : "立即重试"/,
  );
  assert.match(
    editorClientSource,
    /setShowEditorTokenDialog\(false\);[\s\S]*?void savePage\("manual"\)/,
  );
});
