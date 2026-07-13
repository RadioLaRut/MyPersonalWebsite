// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。
import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "../component-manifest.ts";

type PublicRenderer = ComponentConfig["render"];
type PublicRendererModule = { render: PublicRenderer };
type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;

export const LIGHTING_DETAIL_PUBLIC_RENDERER_TYPES = [
  "HomeEndcapSection",
  "ImagePanel",
  "ImageSlider",
  "LightingCollectionHeader",
] as const satisfies readonly PuckComponentType[];

const ROUTE_PUBLIC_RENDERER_LOADERS = {
  HomeEndcapSection: () => import("../public-renderers/home-endcap-section"),
  ImagePanel: () => import("../public-renderers/image-panel"),
  ImageSlider: () => import("../public-renderers/image-slider"),
  LightingCollectionHeader: () => import("../public-renderers/lighting-collection-header"),
} satisfies Partial<Record<PuckComponentType, PublicRendererModuleLoader>>;

export async function loadLightingDetailPublicRenderer(type: PuckComponentType): Promise<PublicRenderer> {
  const loader = ROUTE_PUBLIC_RENDERER_LOADERS[type as keyof typeof ROUTE_PUBLIC_RENDERER_LOADERS];
  if (!loader) {
    throw new Error(`Lighting detail public renderer is stale for Puck component \"${type}\"`);
  }

  const rendererModule = await loader();
  return rendererModule.render;
}
