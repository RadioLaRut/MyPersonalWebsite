import type { Config } from "@measured/puck";

const LAYOUT_COMPONENT_TYPES = [
  "HeroSection",
  "HeroHeadline",
  "StatementBlock",
  "TextSplitLayout",
  "HomeEndcapSection",
  "RichParagraph",
  "ImagePanel",
] as const;

const WORKS_COMPONENT_TYPES = [
  "PortfolioHeroHeader",
  "ProjectSection",
  "WorksList",
  "WorksListEntry",
  "ContentCard",
  "ParameterGrid",
  "HighDensityInfoBlock",
  "ImageSlider",
  "BreakdownHeadline",
  "BreakdownTriptych",
  "NextProjectBlock",
] as const;

const LIGHTING_COMPONENT_TYPES = [
  "LightingCollectionHeader",
  "LightingProjectCard",
] as const;

const CONTACT_COMPONENT_TYPES = [
  "ContactFlashlight",
  "MetadataListItem",
  "TextParagraphBlock",
] as const;

const ALL_COMPONENT_TYPES = [
  ...LAYOUT_COMPONENT_TYPES,
  ...WORKS_COMPONENT_TYPES,
  ...LIGHTING_COMPONENT_TYPES,
  ...CONTACT_COMPONENT_TYPES,
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
  lighting: {
    title: "灯光作品特供",
    components: [...LIGHTING_COMPONENT_TYPES],
  },
  contact: {
    title: "关于与联系",
    components: [...CONTACT_COMPONENT_TYPES],
  },
} satisfies Config["categories"];

export const PUCK_COMPONENT_TYPES: readonly PuckComponentType[] = ALL_COMPONENT_TYPES;

export function isKnownPuckComponentType(value: unknown): value is PuckComponentType {
  return typeof value === "string" && (PUCK_COMPONENT_TYPES as readonly string[]).includes(value);
}

export const PUCK_COMPONENT_TYPE_SET = new Set<string>(PUCK_COMPONENT_TYPES);
