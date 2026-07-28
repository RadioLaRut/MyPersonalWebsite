import {
  type ComponentDesignDocumentV2,
} from "./component-design-v2.ts";
import {
  type ComponentDesignDocumentV3,
} from "./component-design-v3.ts";
import {
  parseComponentDesignDocument,
  type ComponentDesignDocumentV4,
} from "./component-design-v4.ts";

export const COMPONENT_DESIGN_COMMIT_CHANNEL = "component-design-committed-v2";
export const COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE = "component-design-committed";

export type CommittedComponentDesignMessage = {
  document: ComponentDesignDocumentV2;
  type: typeof COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE;
  version: 2;
};

export type ComponentDesignComparableDocument =
  | ComponentDesignDocumentV2
  | ComponentDesignDocumentV3
  | ComponentDesignDocumentV4;

function normalizeComparableDocument(
  document: ComponentDesignComparableDocument,
) {
  return parseComponentDesignDocument(document);
}

export function areComponentDesignDocumentsEqual(
  left: ComponentDesignComparableDocument,
  right: ComponentDesignComparableDocument,
) {
  return left.version === right.version &&
    JSON.stringify(normalizeComparableDocument(left)) ===
      JSON.stringify(normalizeComparableDocument(right));
}

export function reconcileComponentDesignDraftAfterSave<
  Document extends ComponentDesignComparableDocument,
>({
  committedDocument,
  currentDraft,
  submittedDraft,
}: {
  committedDocument: Document;
  currentDraft: Document;
  submittedDraft: Document;
}): Document {
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
    value.version === 2 &&
    "document" in value &&
    value.document &&
    typeof value.document === "object",
  );
}
