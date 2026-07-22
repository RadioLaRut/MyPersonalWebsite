import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  AUTO_SAVE_INTERVAL_MS,
  getApiSaveErrorMessage,
  getSaveStatusNotice,
  getUnexpectedSaveErrorMessage,
} from "./save-status.ts";

const editorShellCss = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor-shell.module.css"),
  "utf8",
);
const editorClientSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor-client.tsx"),
  "utf8",
);

test("page selector tree can extend beyond the Puck layout header", () => {
  const headerRule = editorShellCss.match(
    /\.adminShell\s+:global\(\[class\*="_PuckLayout-header_"\]\)\s*\{([\s\S]*?)\}/,
  );

  assert.ok(headerRule, "Puck layout header override is missing");
  assert.match(headerRule[1], /\bposition:\s*relative\s*;/);
  assert.match(headerRule[1], /\bz-index:\s*50\s*;/);
  assert.match(headerRule[1], /\boverflow:\s*visible\s*!important\s*;/);
});

test("editor reports unsaved, saving, saved, and failed states accessibly", () => {
  assert.match(editorClientSource, /aria-live=\{tone === "error" \? "assertive" : "polite"\}/);
  assert.match(editorClientSource, /role=\{tone === "error" \? "alert" : "status"\}/);
});

test("save status distinguishes dirty, successful, failed, and newer-change states", () => {
  assert.deepEqual(getSaveStatusNotice({
    errorMessage: null,
    hasUnsavedChanges: true,
    publishState: "idle",
    saveTrigger: "manual",
  }), {
    detail: "系统会在 30 秒内自动保存，也可以立即点击 Publish。",
    title: "有未保存的更改",
    tone: "warning",
  });

  assert.deepEqual(getSaveStatusNotice({
    errorMessage: null,
    hasUnsavedChanges: false,
    publishState: "published",
    saveTrigger: "manual",
  }), {
    detail: "当前页面已经写入内容文件，现在可以安全刷新。",
    title: "发布成功，已保存",
    tone: "success",
  });

  assert.deepEqual(getSaveStatusNotice({
    errorMessage: null,
    hasUnsavedChanges: false,
    publishState: "published",
    saveTrigger: "auto",
  }), {
    detail: "当前页面已经写入内容文件，现在可以安全刷新。",
    title: "已自动保存",
    tone: "success",
  });

  assert.deepEqual(getSaveStatusNotice({
    errorMessage: "Token 不匹配",
    hasUnsavedChanges: true,
    publishState: "error",
    saveTrigger: "manual",
  }), {
    detail: "Token 不匹配",
    title: "发布失败",
    tone: "error",
  });

  assert.deepEqual(getSaveStatusNotice({
    errorMessage: null,
    hasUnsavedChanges: true,
    publishState: "published",
    saveTrigger: "auto",
  }), {
    detail: "请再次点击 Publish，或等待 30 秒内的下一次自动保存。",
    title: "上一轮保存成功，但仍有新更改",
    tone: "warning",
  });
});

test("save errors explain token, content validation, storage, and network failures", () => {
  assert.equal(getApiSaveErrorMessage({
    error: {
      code: "EDITOR_TOKEN_REQUIRED",
      message: "technical token error",
    },
  }, 403), "浏览器中的本地编辑 Token 缺失，或与 .env.local 不一致。请重新启用编辑 Token 后重试。");

  assert.equal(getApiSaveErrorMessage({
    error: {
      code: "INVALID_CONTENT",
      issues: [
        { message: "image does not exist", path: "$.content[0].props.heroImage" },
        { message: "image does not exist", path: "$.root.props.image" },
      ],
      message: "strict validation failed",
    },
  }, 422), "内容校验失败：$.content[0].props.heroImage：image does not exist（另有 1 项）");

  const storageError = new Error("localStorage denied");
  storageError.name = "SecurityError";
  assert.equal(
    getUnexpectedSaveErrorMessage(storageError),
    "浏览器禁止读取本地编辑 Token。请允许 localhost 使用本地存储后重试。",
  );
  assert.equal(
    getUnexpectedSaveErrorMessage(new TypeError("Failed to fetch")),
    "无法连接本地保存接口。请确认 npm run dev:test 仍在运行后重试。",
  );
});

test("editor periodically auto-saves dirty data through the serialized save queue", () => {
  assert.equal(AUTO_SAVE_INTERVAL_MS, 30_000);
  assert.match(editorClientSource, /window\.setInterval\(\(\) => \{/);
  assert.match(editorClientSource, /void savePage\("auto"\)/);
  assert.match(editorClientSource, /saveQueueRef\.current\.then\(runSave, runSave\)/);
});

test("save completion does not clear changes made after the saved revision", () => {
  assert.match(editorClientSource, /dataRevisionRef\.current === revision/);
  assert.match(editorClientSource, /hasUnsavedChangesRef\.current = true/);
  assert.match(editorClientSource, /setHasUnsavedChanges\(true\)/);
});
