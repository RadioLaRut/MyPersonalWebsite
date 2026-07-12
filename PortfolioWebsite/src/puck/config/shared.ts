import type { PuckComponentType } from "@/puck/component-manifest";
import { isPlainRecord } from "@/lib/json-utils";
import type { ComponentType } from "react";

export const ALLOW_METADATA_LIST_ITEM = ["MetadataListItem"] as const satisfies readonly PuckComponentType[];
export const ALLOW_TEXT_PARAGRAPH_BLOCK = ["TextParagraphBlock"] as const satisfies readonly PuckComponentType[];
export const ALLOW_WORKS_LIST_ENTRY = ["WorksListEntry"] as const satisfies readonly PuckComponentType[];

type PuckSlotComponent = ComponentType<{
  allow?: readonly PuckComponentType[];
  className?: string;
  minEmptyHeight?: number;
}>;

type EntryFieldKey =
  | "category"
  | "company"
  | "desc"
  | "href"
  | "id"
  | "imageFitMode"
  | "imagePreset"
  | "imageSrc"
  | "label"
  | "number"
  | "role"
  | "subtitle"
  | "text"
  | "title"
  | "value";

export function pickEntryField<T = string>(entry: unknown, ...keys: EntryFieldKey[]): T | undefined {
  if (!isPlainRecord(entry)) {
    return undefined;
  }

  const props = isPlainRecord(entry.props) ? entry.props : {};

  for (const key of keys) {
    const propsValue = props[key];
    if (propsValue !== undefined && propsValue !== null) {
      return propsValue as T;
    }

    const directValue = entry[key];
    if (directValue !== undefined && directValue !== null) {
      return directValue as T;
    }
  }

  return undefined;
}

export function readSlot<T>(
  value: unknown,
  mapItem: (entry: unknown) => T,
): { items: T[] | undefined; SlotComponent: PuckSlotComponent | null } {
  if (Array.isArray(value)) {
    return {
      items: value.map(mapItem),
      SlotComponent: null,
    };
  }

  return {
    items: undefined,
    SlotComponent: value as PuckSlotComponent,
  };
}

export { toEditorAwareHref, toSafePuckHref } from "@/lib/puck-href";
