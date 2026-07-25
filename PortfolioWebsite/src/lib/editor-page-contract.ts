import type { Data } from "@puckeditor/core";

import { PAGE_DOCUMENT_VERSION, type PageDocument } from "./page-document-contract.ts";

export type PageSummary = {
  slug: string;
  publicPath: string;
  title: string;
};

export type CreatePageRequest =
  | { slug: string; mode: "blank" }
  | { slug: string; mode: "duplicate"; sourceSlug: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function createBlankPageDocument(): PageDocument {
  return {
    content: [],
    root: {
      props: {
        description: "",
        image: "",
        noIndex: true,
        title: "",
      },
    },
    version: PAGE_DOCUMENT_VERSION,
    zones: {},
  };
}

export function duplicatePageDocument(data: Data, createId: () => string): PageDocument {
  function duplicateValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(duplicateValue);
    if (!isRecord(value)) return value;

    const replacementId = (
      typeof value.type === "string" &&
      isRecord(value.props) &&
      typeof value.props.id === "string"
    )
      ? createId()
      : null;
    const result = Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, duplicateValue(entry)]),
    );
    if (replacementId && isRecord(result.props)) {
      result.props.id = replacementId;
    }
    return result;
  }

  const duplicated = duplicateValue(data) as PageDocument;
  return {
    ...duplicated,
    root: {
      ...duplicated.root,
      props: {
        ...duplicated.root.props,
        noIndex: true,
        title: `${duplicated.root.props.title || "未命名页面"}（副本）`,
      },
    },
  };
}

export function isCreatePageRequest(value: unknown): value is CreatePageRequest {
  if (!isRecord(value) || typeof value.slug !== "string") return false;
  if (value.mode === "blank") return true;
  return value.mode === "duplicate" && typeof value.sourceSlug === "string";
}
