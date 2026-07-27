import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyComponentLabSaveConflict,
  mergeComponentLabRemoteDocument,
} from "./component-lab-save-conflict.ts";
import {
  createDefaultComponentDesignDocument,
} from "./component-design-v3.ts";

const isEqual = (left: { value: number }, right: { value: number }) =>
  left.value === right.value;

test("响应丢失后服务器已有本地结果时视为保存完成", () => {
  assert.equal(
    classifyComponentLabSaveConflict({
      isEqual,
      localValue: { value: 2 },
      serverValue: { value: 2 },
      submittedAgainst: { value: 1 },
    }),
    "already-committed",
  );
});

test("只有其他版式变化时允许基于新 revision 重试", () => {
  assert.equal(
    classifyComponentLabSaveConflict({
      isEqual,
      localValue: { value: 2 },
      serverValue: { value: 1 },
      submittedAgainst: { value: 1 },
    }),
    "rebase",
  );
});

test("当前版式被另一窗口改动时进入显式冲突选择", () => {
  assert.equal(
    classifyComponentLabSaveConflict({
      isEqual,
      localValue: { value: 2 },
      serverValue: { value: 3 },
      submittedAgainst: { value: 1 },
    }),
    "conflict",
  );
});

test("没有待保存事务时完整采用服务端最新文档", () => {
  const localDocument = createDefaultComponentDesignDocument();
  const remoteDocument = createDefaultComponentDesignDocument();
  localDocument.components.HeroSection.variants.full.sampleText.title =
    "本地旧标题";
  remoteDocument.components.HeroSection.variants.full.sampleText.title =
    "远端新标题";
  remoteDocument.components.RichParagraph.variants.default.sampleText.body =
    "远端正文";

  const merged = mergeComponentLabRemoteDocument({
    localDocument,
    pendingScopes: [],
    remoteDocument,
  });

  assert.equal(
    merged.components.HeroSection.variants.full.sampleText.title,
    "远端新标题",
  );
  assert.equal(
    merged.components.RichParagraph.variants.default.sampleText.body,
    "远端正文",
  );
  merged.components.HeroSection.variants.full.sampleText.title = "修改合并结果";
  assert.equal(
    remoteDocument.components.HeroSection.variants.full.sampleText.title,
    "远端新标题",
  );
});

test("多个待保存版式保留各自最新本地值并合入其他远端变化", () => {
  const localDocument = createDefaultComponentDesignDocument();
  const remoteDocument = createDefaultComponentDesignDocument();
  localDocument.components.HeroSection.variants.full.sampleText.title =
    "本地 Hero";
  localDocument.components.EditorialHeader.variants.index.sampleText.title =
    "本地页头";
  remoteDocument.components.HeroSection.variants.full.sampleText.title =
    "远端 Hero";
  remoteDocument.components.EditorialHeader.variants.index.sampleText.title =
    "远端页头";
  remoteDocument.components.RichParagraph.variants.default.sampleText.body =
    "远端未排队版式";

  const merged = mergeComponentLabRemoteDocument({
    localDocument,
    pendingScopes: [
      { component: "HeroSection", variant: "full" },
      { component: "EditorialHeader", variant: "index" },
      { component: "HeroSection", variant: "full" },
    ],
    remoteDocument,
  });

  assert.equal(
    merged.components.HeroSection.variants.full.sampleText.title,
    "本地 Hero",
  );
  assert.equal(
    merged.components.EditorialHeader.variants.index.sampleText.title,
    "本地页头",
  );
  assert.equal(
    merged.components.RichParagraph.variants.default.sampleText.body,
    "远端未排队版式",
  );
});

test("409 重基线保留排队结果和尚未入队的文字事务", () => {
  const localDocument = createDefaultComponentDesignDocument();
  const remoteDocument = createDefaultComponentDesignDocument();
  localDocument.components.HeroSection.variants.full.sampleText.title =
    "待重试标题";
  localDocument.components.EditorialHeader.variants.collection.sampleText
    .description = "输入中的说明";
  remoteDocument.components.HeroSection.variants.full.sampleText.title =
    "请求前标题";
  remoteDocument.components.EditorialHeader.variants.collection.sampleText
    .description = "远端说明";
  remoteDocument.components.RichParagraph.variants.default.sampleText.body =
    "另一窗口正文";

  const merged = mergeComponentLabRemoteDocument({
    localDocument,
    pendingScopes: [{ component: "HeroSection", variant: "full" }],
    remoteDocument,
    textTransactionScope: {
      component: "EditorialHeader",
      variant: "collection",
    },
  });

  assert.equal(
    merged.components.HeroSection.variants.full.sampleText.title,
    "待重试标题",
  );
  assert.equal(
    merged.components.EditorialHeader.variants.collection.sampleText
      .description,
    "输入中的说明",
  );
  assert.equal(
    merged.components.RichParagraph.variants.default.sampleText.body,
    "另一窗口正文",
  );
});

test("当前冲突目标即使暂未出现在队列中也保留本地结果", () => {
  const localDocument = createDefaultComponentDesignDocument();
  const remoteDocument = createDefaultComponentDesignDocument();
  localDocument.components.HeroSection.variants.full.sampleText.title =
    "待用户裁决";
  remoteDocument.components.HeroSection.variants.full.sampleText.title =
    "另一窗口标题";
  remoteDocument.components.RichParagraph.variants.default.sampleText.body =
    "远端正文";

  const merged = mergeComponentLabRemoteDocument({
    conflictScope: { component: "HeroSection", variant: "full" },
    localDocument,
    pendingScopes: [],
    remoteDocument,
  });

  assert.equal(
    merged.components.HeroSection.variants.full.sampleText.title,
    "待用户裁决",
  );
  assert.equal(
    merged.components.RichParagraph.variants.default.sampleText.body,
    "远端正文",
  );
});
