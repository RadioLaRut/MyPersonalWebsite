import type { PuckComponentType } from "./component-manifest.ts";

export const PUBLIC_RENDERER_MODULE_NAMES = {
  BilibiliEmbed: "bilibili-embed",
  BreakdownHeadline: "breakdown-headline",
  ContactFlashlight: "contact-flashlight",
  EditorialHeader: "editorial-header",
  EditorialSplit: "editorial-split",
  HeroHeadline: "hero-headline",
  HeroSection: "hero-section",
  HomeEndcapSection: "home-endcap-section",
  ImagePanel: "image-panel",
  ImageSlider: "image-slider",
  MetadataListItem: "metadata-list-item",
  NextProjectBlock: "next-project-block",
  ParameterGrid: "parameter-grid",
  ProjectCoverLink: "project-cover-link",
  RichParagraph: "rich-paragraph",
  StatementBlock: "statement-block",
  TextParagraphBlock: "text-paragraph-block",
  ThreeColumnSection: "three-column-section",
  WorksList: "works-list",
  WorksListEntry: "works-list-entry",
} as const satisfies Record<PuckComponentType, string>;
