// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。
import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "../component-manifest.ts";

type PublicRenderer = ComponentConfig["render"];
type PublicRendererModule = { render: PublicRenderer };
type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;

export const LIGHTING_INDEX_PUBLIC_RENDERER_TYPES = [
  "PortfolioHeroHeader",
  "NextProjectBlock",
  "LightingProjectCard",
] as const satisfies readonly PuckComponentType[];

const ROUTE_PUBLIC_RENDERER_LOADERS = {
  PortfolioHeroHeader: () => import("../public-renderers/portfolio-hero-header"),
  NextProjectBlock: () => import("../public-renderers/next-project-block"),
  LightingProjectCard: () => import("../public-renderers/lighting-project-card"),
} satisfies Partial<Record<PuckComponentType, PublicRendererModuleLoader>>;

export async function loadLightingIndexPublicRenderer(type: PuckComponentType): Promise<PublicRenderer> {
  const loader = ROUTE_PUBLIC_RENDERER_LOADERS[type as keyof typeof ROUTE_PUBLIC_RENDERER_LOADERS];
  if (!loader) {
    throw new Error(`Lighting index public renderer is stale for Puck component \"${type}\"`);
  }

  const rendererModule = await loader();
  return rendererModule.render;
}
