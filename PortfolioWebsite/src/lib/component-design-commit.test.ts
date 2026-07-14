import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultComponentDesignDocument } from "./component-design-schema.ts";
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
    version: 1,
  };

  assert.equal(isCommittedComponentDesignMessage(message), true);
  assert.equal(isCommittedComponentDesignMessage({ ...message, version: 2 }), false);
  assert.equal(isCommittedComponentDesignMessage({ document: message.document }), false);
});

test("保存响应只替换提交时仍未变化的草稿", () => {
  const submittedDraft = createDefaultComponentDesignDocument();
  const committedDocument = structuredClone(submittedDraft);
  const newerDraft = structuredClone(submittedDraft);
  newerDraft.components.HeroSection.eyebrowTopSpacing = "16";

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
