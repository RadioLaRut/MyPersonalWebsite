import type { Config } from "@puckeditor/core";

import type { MediaLayoutProfileKey } from "../lib/media-layout.ts";
import type { TypographyPreset } from "../lib/typography-tokens.ts";

export type PuckComponentCategory = "layout" | "works" | "contact" | "internal";

export type PuckTypographyUsageDescriptor = {
  preset: TypographyPreset;
  propPaths: readonly string[];
};

export type PuckComponentDescriptor = {
  type: string;
  category: PuckComponentCategory;
  rendererKey: string;
  propSchemaKey: string;
  labVisibility: "author" | "internal";
  firstViewportTypography?: readonly PuckTypographyUsageDescriptor[];
  mediaProfile?: MediaLayoutProfileKey;
  mediaPreload?: "first-viewport" | "deferred";
};

export const PUCK_COMPONENT_DESCRIPTORS = [
  {
    type: "HeroSection",
    category: "layout",
    rendererKey: "hero-section",
    propSchemaKey: "HeroSection",
    labVisibility: "author",
    firstViewportTypography: [
      { preset: "luna-editorial", propPaths: ["title"] },
    ],
    mediaProfile: "full-bleed",
    mediaPreload: "first-viewport",
  },
  {
    type: "HeroHeadline",
    category: "layout",
    rendererKey: "hero-headline",
    propSchemaKey: "HeroHeadline",
    labVisibility: "author",
    firstViewportTypography: [
      { preset: "luna-editorial", propPaths: ["title"] },
    ],
    mediaProfile: "full-bleed",
    mediaPreload: "first-viewport",
  },
  {
    type: "EditorialHeader",
    category: "layout",
    rendererKey: "editorial-header",
    propSchemaKey: "EditorialHeader",
    labVisibility: "author",
    firstViewportTypography: [
      { preset: "luna-editorial", propPaths: ["title", "subtitle"] },
    ],
  },
  {
    type: "EditorialSplit",
    category: "layout",
    rendererKey: "editorial-split",
    propSchemaKey: "EditorialSplit",
    labVisibility: "author",
    mediaProfile: "grid-6",
    mediaPreload: "first-viewport",
  },
  {
    type: "ThreeColumnSection",
    category: "layout",
    rendererKey: "three-column-section",
    propSchemaKey: "ThreeColumnSection",
    labVisibility: "author",
    mediaProfile: "grid-4",
    mediaPreload: "first-viewport",
  },
  {
    type: "StatementBlock",
    category: "layout",
    rendererKey: "statement-block",
    propSchemaKey: "StatementBlock",
    labVisibility: "author",
  },
  {
    type: "RichParagraph",
    category: "layout",
    rendererKey: "rich-paragraph",
    propSchemaKey: "RichParagraph",
    labVisibility: "author",
  },
  {
    type: "ImagePanel",
    category: "layout",
    rendererKey: "image-panel",
    propSchemaKey: "ImagePanel",
    labVisibility: "author",
    mediaProfile: "grid-10",
    mediaPreload: "first-viewport",
  },
  {
    type: "BilibiliEmbed",
    category: "layout",
    rendererKey: "bilibili-embed",
    propSchemaKey: "BilibiliEmbed",
    labVisibility: "author",
  },
  {
    type: "ProjectCoverLink",
    category: "works",
    rendererKey: "project-cover-link",
    propSchemaKey: "ProjectCoverLink",
    labVisibility: "author",
    firstViewportTypography: [
      { preset: "luna-editorial", propPaths: ["title"] },
    ],
    mediaProfile: "full-bleed",
    mediaPreload: "first-viewport",
  },
  {
    type: "WorksList",
    category: "works",
    rendererKey: "works-list",
    propSchemaKey: "WorksList",
    labVisibility: "author",
    firstViewportTypography: [
      {
        preset: "luna-editorial",
        propPaths: ["entries.0.props.title"],
      },
      {
        preset: "gothic-editorial",
        propPaths: ["entries.0.props.category"],
      },
    ],
    mediaProfile: "grid-5",
    mediaPreload: "deferred",
  },
  {
    type: "ParameterGrid",
    category: "works",
    rendererKey: "parameter-grid",
    propSchemaKey: "ParameterGrid",
    labVisibility: "author",
    mediaProfile: "full-bleed",
    mediaPreload: "first-viewport",
  },
  {
    type: "ImageSlider",
    category: "works",
    rendererKey: "image-slider",
    propSchemaKey: "ImageSlider",
    labVisibility: "author",
    mediaProfile: "grid-10",
    mediaPreload: "first-viewport",
  },
  {
    type: "BreakdownHeadline",
    category: "works",
    rendererKey: "breakdown-headline",
    propSchemaKey: "BreakdownHeadline",
    labVisibility: "author",
  },
  {
    type: "NextProjectBlock",
    category: "works",
    rendererKey: "next-project-block",
    propSchemaKey: "NextProjectBlock",
    labVisibility: "author",
    mediaProfile: "full-bleed",
    mediaPreload: "deferred",
  },
  {
    type: "HomeEndcapSection",
    category: "contact",
    rendererKey: "home-endcap-section",
    propSchemaKey: "HomeEndcapSection",
    labVisibility: "author",
    firstViewportTypography: [
      { preset: "luna-editorial", propPaths: ["title"] },
    ],
  },
  {
    type: "ContactFlashlight",
    category: "contact",
    rendererKey: "contact-flashlight",
    propSchemaKey: "ContactFlashlight",
    labVisibility: "author",
    firstViewportTypography: [
      { preset: "luna-editorial", propPaths: ["name"] },
    ],
  },
  {
    type: "WorksListEntry",
    category: "internal",
    rendererKey: "works-list-entry",
    propSchemaKey: "WorksListEntry",
    labVisibility: "internal",
    mediaProfile: "grid-5",
    mediaPreload: "deferred",
  },
  {
    type: "MetadataListItem",
    category: "internal",
    rendererKey: "metadata-list-item",
    propSchemaKey: "MetadataListItem",
    labVisibility: "internal",
  },
  {
    type: "TextParagraphBlock",
    category: "internal",
    rendererKey: "text-paragraph-block",
    propSchemaKey: "TextParagraphBlock",
    labVisibility: "internal",
  },
] as const satisfies readonly PuckComponentDescriptor[];

export type PuckComponentType =
  (typeof PUCK_COMPONENT_DESCRIPTORS)[number]["type"];

export const PUCK_COMPONENT_TYPES = PUCK_COMPONENT_DESCRIPTORS.map(
  (descriptor) => descriptor.type,
) as readonly PuckComponentType[];

export const PUCK_COMPONENT_DESCRIPTOR_BY_TYPE = Object.fromEntries(
  PUCK_COMPONENT_DESCRIPTORS.map((descriptor) => [descriptor.type, descriptor]),
) as unknown as Record<PuckComponentType, (typeof PUCK_COMPONENT_DESCRIPTORS)[number]>;

export const PUCK_COMPONENT_CATEGORIES = {
  layout: {
    title: "基础布局",
    components: PUCK_COMPONENT_DESCRIPTORS
      .filter((descriptor) => descriptor.category === "layout")
      .map((descriptor) => descriptor.type),
  },
  works: {
    title: "作品展示",
    components: PUCK_COMPONENT_DESCRIPTORS
      .filter((descriptor) => descriptor.category === "works")
      .map((descriptor) => descriptor.type),
  },
  contact: {
    title: "关于与联系",
    components: PUCK_COMPONENT_DESCRIPTORS
      .filter((descriptor) => descriptor.category === "contact")
      .map((descriptor) => descriptor.type),
  },
  internal: {
    title: "内部 Slot 类型",
    components: PUCK_COMPONENT_DESCRIPTORS
      .filter((descriptor) => descriptor.category === "internal")
      .map((descriptor) => descriptor.type),
    visible: false,
  },
} satisfies Config["categories"];

export function isKnownPuckComponentType(value: unknown): value is PuckComponentType {
  return typeof value === "string" && (PUCK_COMPONENT_TYPES as readonly string[]).includes(value);
}

export const PUCK_COMPONENT_TYPE_SET = new Set<string>(PUCK_COMPONENT_TYPES);
