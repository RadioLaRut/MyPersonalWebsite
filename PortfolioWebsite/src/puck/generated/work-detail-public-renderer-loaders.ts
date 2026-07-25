// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。
import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "../component-manifest.ts";

type PublicRenderer = ComponentConfig["render"];
type PublicRendererModule = { render: PublicRenderer };
type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;

export const WORK_DETAIL_PUBLIC_RENDERER_TYPES = [
  "HeroHeadline",
  "EditorialSplit",
  "ThreeColumnSection",
  "RichParagraph",
  "ImagePanel",
  "BilibiliEmbed",
  "ParameterGrid",
  "ImageSlider",
  "BreakdownHeadline",
  "NextProjectBlock",
  "HomeEndcapSection",
  "TextParagraphBlock",
] as const satisfies readonly PuckComponentType[];

const ROUTE_PUBLIC_RENDERER_LOADERS = {
  HeroHeadline: () => import("../public-renderers/hero-headline"),
  EditorialSplit: () => import("../public-renderers/editorial-split"),
  ThreeColumnSection: () => import("../public-renderers/three-column-section"),
  RichParagraph: () => import("../public-renderers/rich-paragraph"),
  ImagePanel: () => import("../public-renderers/image-panel"),
  BilibiliEmbed: () => import("../public-renderers/bilibili-embed"),
  ParameterGrid: () => import("../public-renderers/parameter-grid"),
  ImageSlider: () => import("../public-renderers/image-slider"),
  BreakdownHeadline: () => import("../public-renderers/breakdown-headline"),
  NextProjectBlock: () => import("../public-renderers/next-project-block"),
  HomeEndcapSection: () => import("../public-renderers/home-endcap-section"),
  TextParagraphBlock: () => import("../public-renderers/text-paragraph-block"),
} satisfies Partial<Record<PuckComponentType, PublicRendererModuleLoader>>;

export async function loadWorkDetailPublicRenderer(type: PuckComponentType): Promise<PublicRenderer> {
  const loader = ROUTE_PUBLIC_RENDERER_LOADERS[type as keyof typeof ROUTE_PUBLIC_RENDERER_LOADERS];
  if (!loader) {
    throw new Error(`Work detail public renderer is stale for Puck component \"${type}\"`);
  }

  const rendererModule = await loader();
  return rendererModule.render;
}
