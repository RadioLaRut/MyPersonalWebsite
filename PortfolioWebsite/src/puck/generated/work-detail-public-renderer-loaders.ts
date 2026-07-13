// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。
import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "../component-manifest.ts";

type PublicRenderer = ComponentConfig["render"];
type PublicRendererModule = { render: PublicRenderer };
type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;

export const WORK_DETAIL_PUBLIC_RENDERER_TYPES = [
  "HeroHeadline",
  "TextSplitLayout",
  "HomeEndcapSection",
  "RichParagraph",
  "ImagePanel",
  "ContentCard",
  "ParameterGrid",
  "HighDensityInfoBlock",
  "ImageSlider",
  "BreakdownHeadline",
  "BreakdownTriptych",
  "NextProjectBlock",
  "TextParagraphBlock",
] as const satisfies readonly PuckComponentType[];

const ROUTE_PUBLIC_RENDERER_LOADERS = {
  HeroHeadline: () => import("../public-renderers/hero-headline"),
  TextSplitLayout: () => import("../public-renderers/text-split-layout"),
  HomeEndcapSection: () => import("../public-renderers/home-endcap-section"),
  RichParagraph: () => import("../public-renderers/rich-paragraph"),
  ImagePanel: () => import("../public-renderers/image-panel"),
  ContentCard: () => import("../public-renderers/content-card"),
  ParameterGrid: () => import("../public-renderers/parameter-grid"),
  HighDensityInfoBlock: () => import("../public-renderers/high-density-info-block"),
  ImageSlider: () => import("../public-renderers/image-slider"),
  BreakdownHeadline: () => import("../public-renderers/breakdown-headline"),
  BreakdownTriptych: () => import("../public-renderers/breakdown-triptych"),
  NextProjectBlock: () => import("../public-renderers/next-project-block"),
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
