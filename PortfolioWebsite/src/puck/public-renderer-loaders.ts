import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "./component-manifest.ts";

export type PublicRenderer = ComponentConfig["render"];
type PublicRendererModule = { render: PublicRenderer };
type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;

export const PUBLIC_RENDERER_LOADERS = {
  BilibiliEmbed: () => import("./public-renderers/bilibili-embed"),
  BreakdownHeadline: () => import("./public-renderers/breakdown-headline"),
  ContactFlashlight: () => import("./public-renderers/contact-flashlight"),
  EditorialHeader: () => import("./public-renderers/editorial-header"),
  EditorialSplit: () => import("./public-renderers/editorial-split"),
  HeroHeadline: () => import("./public-renderers/hero-headline"),
  HeroSection: () => import("./public-renderers/hero-section"),
  HomeEndcapSection: () => import("./public-renderers/home-endcap-section"),
  ImagePanel: () => import("./public-renderers/image-panel"),
  ImageSlider: () => import("./public-renderers/image-slider"),
  MetadataListItem: () => import("./public-renderers/metadata-list-item"),
  NextProjectBlock: () => import("./public-renderers/next-project-block"),
  ParameterGrid: () => import("./public-renderers/parameter-grid"),
  ProjectCoverLink: () => import("./public-renderers/project-cover-link"),
  RichParagraph: () => import("./public-renderers/rich-paragraph"),
  StatementBlock: () => import("./public-renderers/statement-block"),
  TextParagraphBlock: () => import("./public-renderers/text-paragraph-block"),
  ThreeColumnSection: () => import("./public-renderers/three-column-section"),
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
