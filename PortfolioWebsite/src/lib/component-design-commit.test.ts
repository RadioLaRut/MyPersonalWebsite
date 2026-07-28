import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultComponentDesignDocument } from "./component-design-v2.ts";
import {
  createDefaultComponentDesignDocument as createDefaultComponentDesignDocumentV4,
} from "./component-design-v4.ts";
import {
  areComponentDesignDocumentsEqual,
  COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE,
  isCommittedComponentDesignMessage,
  reconcileComponentDesignDraftAfterSave,
} from "./component-design-commit.ts";

test("已提交组件设计消息与草稿数据有明确协议边界", () => {
  const message = {
    document: createDefaultComponentDesignDocument(),
    type: COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE,
    version: 2,
  };

  assert.equal(isCommittedComponentDesignMessage(message), true);
  assert.equal(isCommittedComponentDesignMessage({ ...message, version: 1 }), false);
  assert.equal(isCommittedComponentDesignMessage({ document: message.document }), false);
});

test("保存响应只替换提交时仍未变化的草稿", () => {
  const submittedDraft = createDefaultComponentDesignDocument();
  const committedDocument = structuredClone(submittedDraft);
  const newerDraft = structuredClone(submittedDraft);
  newerDraft.components.HeroSection.variants.poster.nodes.title.placement.desktop = {
    span: 10,
    start: 2,
  };

  assert.equal(
    areComponentDesignDocumentsEqual(submittedDraft, committedDocument),
    true,
  );
  assert.strictEqual(
    reconcileComponentDesignDraftAfterSave({
      committedDocument,
      currentDraft: submittedDraft,
      submittedDraft,
    }),
    committedDocument,
  );
  assert.strictEqual(
    reconcileComponentDesignDraftAfterSave({
      committedDocument,
      currentDraft: newerDraft,
      submittedDraft,
    }),
    newerDraft,
  );
});

test("V4 草稿比较包含样例文字、设备覆盖和 composition", () => {
  const submittedDraft = createDefaultComponentDesignDocumentV4();
  const committedDocument = structuredClone(submittedDraft);
  const newerDraft = structuredClone(submittedDraft);
  newerDraft.components.HeroSection.variants.full.sampleText.title =
    "尚未提交的新文字";

  assert.equal(
    areComponentDesignDocumentsEqual(submittedDraft, committedDocument),
    true,
  );
  assert.equal(
    areComponentDesignDocumentsEqual(submittedDraft, newerDraft),
    false,
  );
  const invalidCompositionDraft = structuredClone(submittedDraft);
  invalidCompositionDraft.components.HeroSection.variants.full.composition = [];
  assert.equal(
    areComponentDesignDocumentsEqual(
      submittedDraft,
      invalidCompositionDraft,
    ),
    false,
  );
  assert.strictEqual(
    reconcileComponentDesignDraftAfterSave({
      committedDocument,
      currentDraft: newerDraft,
      submittedDraft,
    }),
    newerDraft,
  );
});
