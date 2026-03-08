import type { ReactNode } from "react";

export type EditableTextValue = ReactNode | string | null | undefined;

export function isPlainTextValue(value: EditableTextValue): value is string {
  return typeof value === "string";
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
