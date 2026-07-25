import type { Config } from "@puckeditor/core";

const LAYOUT_COMPONENT_TYPES = [
  "HeroSection",
  "HeroHeadline",
  "EditorialHeader",
  "EditorialSplit",
  "ThreeColumnSection",
  "StatementBlock",
  "RichParagraph",
  "ImagePanel",
  "BilibiliEmbed",
] as const;

const WORKS_COMPONENT_TYPES = [
  "ProjectCoverLink",
  "WorksList",
  "ParameterGrid",
  "ImageSlider",
  "BreakdownHeadline",
  "NextProjectBlock",
] as const;

const CONTACT_COMPONENT_TYPES = [
  "HomeEndcapSection",
  "ContactFlashlight",
] as const;

const INTERNAL_COMPONENT_TYPES = [
  "WorksListEntry",
  "MetadataListItem",
  "TextParagraphBlock",
] as const;

const ALL_COMPONENT_TYPES = [
  ...LAYOUT_COMPONENT_TYPES,
  ...WORKS_COMPONENT_TYPES,
  ...CONTACT_COMPONENT_TYPES,
  ...INTERNAL_COMPONENT_TYPES,
] as const;

export type PuckComponentType = (typeof ALL_COMPONENT_TYPES)[number];

export const PUCK_COMPONENT_CATEGORIES = {
  layout: {
    title: "基础布局",
    components: [...LAYOUT_COMPONENT_TYPES],
  },
  works: {
    title: "作品展示",
    components: [...WORKS_COMPONENT_TYPES],
  },
  contact: {
    title: "关于与联系",
    components: [...CONTACT_COMPONENT_TYPES],
  },
  internal: {
    title: "内部 Slot 类型",
    components: [...INTERNAL_COMPONENT_TYPES],
    visible: false,
  },
} satisfies Config["categories"];

export const PUCK_COMPONENT_TYPES: readonly PuckComponentType[] = ALL_COMPONENT_TYPES;

export function isKnownPuckComponentType(value: unknown): value is PuckComponentType {
  return typeof value === "string" && (PUCK_COMPONENT_TYPES as readonly string[]).includes(value);
}

export const PUCK_COMPONENT_TYPE_SET = new Set<string>(PUCK_COMPONENT_TYPES);
