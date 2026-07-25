import { isValidElement, type ReactNode } from "react";

export type EditableTextValue = ReactNode | string | null | undefined;

type InlineEditableTextProps = {
  children?: ReactNode;
  componentId?: unknown;
  propPath?: unknown;
  value?: unknown;
};

export function getInlineEditableTextValue(
  value: EditableTextValue,
): string | undefined {
  if (!isValidElement<InlineEditableTextProps>(value)) {
    return undefined;
  }

  const { componentId, propPath } = value.props;
  if (typeof componentId !== "string" || typeof propPath !== "string") {
    return undefined;
  }

  return typeof value.props.value === "string" ? value.props.value : "";
}

export function isPlainTextValue(value: EditableTextValue): value is string {
  return typeof value === "string";
}

export function hasEditableTextContent(value: EditableTextValue): boolean {
  if (value === null || value === undefined || value === false) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(hasEditableTextContent);
  }

  const inlineValue = getInlineEditableTextValue(value);
  if (inlineValue !== undefined) {
    return inlineValue.trim().length > 0;
  }

  return true;
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

  const inlineValue = getInlineEditableTextValue(value);
  if (inlineValue !== undefined && inlineValue.trim().length === 0) {
    return fallback;
  }

  return value;
}

export function toPlainText(value: EditableTextValue): string | undefined {
  const text = typeof value === "string"
    ? value
    : getInlineEditableTextValue(value);

  if (text === undefined) {
    return undefined;
  }

  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toParagraphNodes(value: EditableTextValue): ReactNode[] {
  if (value == null) {
    return [];
  }

  if (!isPlainTextValue(value)) {
    const inlineValue = getInlineEditableTextValue(value);
    if (inlineValue !== undefined && inlineValue.trim().length === 0) {
      return [];
    }

    return [value];
  }

  return value
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
