import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "./component-manifest.ts";

export type PublicRenderer = ComponentConfig["render"];
type PublicRendererModule = { render: PublicRenderer };
type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;

export const PUBLIC_RENDERER_LOADERS = {
  BreakdownHeadline: () => import("./public-renderers/breakdown-headline"),
  BreakdownTriptych: () => import("./public-renderers/breakdown-triptych"),
  ContactFlashlight: () => import("./public-renderers/contact-flashlight"),
  ContentCard: () => import("./public-renderers/content-card"),
  HeroHeadline: () => import("./public-renderers/hero-headline"),
  HeroSection: () => import("./public-renderers/hero-section"),
  HighDensityInfoBlock: () => import("./public-renderers/high-density-info-block"),
  HomeEndcapSection: () => import("./public-renderers/home-endcap-section"),
  ImagePanel: () => import("./public-renderers/image-panel"),
  ImageSlider: () => import("./public-renderers/image-slider"),
  LightingCollectionHeader: () => import("./public-renderers/lighting-collection-header"),
  LightingProjectCard: () => import("./public-renderers/lighting-project-card"),
  MetadataListItem: () => import("./public-renderers/metadata-list-item"),
  NextProjectBlock: () => import("./public-renderers/next-project-block"),
  ParameterGrid: () => import("./public-renderers/parameter-grid"),
  PortfolioHeroHeader: () => import("./public-renderers/portfolio-hero-header"),
  ProjectSection: () => import("./public-renderers/project-section"),
  RichParagraph: () => import("./public-renderers/rich-paragraph"),
  StatementBlock: () => import("./public-renderers/statement-block"),
  TextParagraphBlock: () => import("./public-renderers/text-paragraph-block"),
  TextSplitLayout: () => import("./public-renderers/text-split-layout"),
  WorksList: () => import("./public-renderers/works-list"),
  WorksListEntry: () => import("./public-renderers/works-list-entry"),
} satisfies Record<PuckComponentType, PublicRendererModuleLoader>;

export async function loadPublicRenderer(type: PuckComponentType): Promise<PublicRenderer> {
  const rendererModule = await PUBLIC_RENDERER_LOADERS[type]();
  if (typeof rendererModule.render !== "function") {
    throw new Error(`Missing public renderer for Puck component "${type}"`);
  }
  return rendererModule.render;
}
