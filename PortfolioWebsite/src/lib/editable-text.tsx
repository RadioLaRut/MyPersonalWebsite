import type { ReactNode } from "react";

export type EditableTextValue = ReactNode | string | null | undefined;

export function isPlainTextValue(value: EditableTextValue): value is string {
  return typeof value === "string";
}

export function resolveEditableText(
  value: EditableTextValue,
  fallback: ReactNode,
): ReactNode {
  if (typeof value === "string") {
    return value.trim().length > 0 ? value : fallback;
  }

  if (value == null) {
    return fallback;
  }

  return value;
}

export function toPlainText(value: EditableTextValue): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toParagraphNodes(value: EditableTextValue): ReactNode[] {
  if (value == null) {
    return [];
  }

  if (!isPlainTextValue(value)) {
    return [value];
  }

  return value
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
