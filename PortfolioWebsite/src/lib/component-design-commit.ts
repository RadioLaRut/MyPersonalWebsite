import {
  normalizeComponentDesignDocument,
  type ComponentDesignDocument,
} from "./component-design-schema.ts";

export const COMPONENT_DESIGN_COMMIT_CHANNEL = "component-design-committed-v1";
export const COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE = "component-design-committed";

export type CommittedComponentDesignMessage = {
  document: ComponentDesignDocument;
  type: typeof COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE;
  version: 1;
};

export function areComponentDesignDocumentsEqual(
  left: ComponentDesignDocument,
  right: ComponentDesignDocument,
) {
  return JSON.stringify(normalizeComponentDesignDocument(left)) ===
    JSON.stringify(normalizeComponentDesignDocument(right));
}

export function reconcileComponentDesignDraftAfterSave({
  committedDocument,
  currentDraft,
  submittedDraft,
}: {
  committedDocument: ComponentDesignDocument;
  currentDraft: ComponentDesignDocument;
  submittedDraft: ComponentDesignDocument;
}) {
  return areComponentDesignDocumentsEqual(currentDraft, submittedDraft)
    ? committedDocument
    : currentDraft;
}

export function isCommittedComponentDesignMessage(
  value: unknown,
): value is CommittedComponentDesignMessage {
  return Boolean(
    value &&
    typeof value === "object" &&
    "type" in value &&
    value.type === COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE &&
    "version" in value &&
    value.version === 1 &&
    "document" in value &&
    value.document &&
    typeof value.document === "object",
  );
}
