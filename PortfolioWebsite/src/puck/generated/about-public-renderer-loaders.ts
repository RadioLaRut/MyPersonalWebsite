// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。
import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "../component-manifest.ts";

type PublicRenderer = ComponentConfig["render"];
type PublicRendererModule = { render: PublicRenderer };
type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;

export const ABOUT_PUBLIC_RENDERER_TYPES = [
  "EditorialHeader",
  "ThreeColumnSection",
  "HomeEndcapSection",
  "ContactFlashlight",
  "MetadataListItem",
] as const satisfies readonly PuckComponentType[];

const ROUTE_PUBLIC_RENDERER_LOADERS = {
  EditorialHeader: () => import("../public-renderers/editorial-header"),
  ThreeColumnSection: () => import("../public-renderers/three-column-section"),
  HomeEndcapSection: () => import("../public-renderers/home-endcap-section"),
  ContactFlashlight: () => import("../public-renderers/contact-flashlight"),
  MetadataListItem: () => import("../public-renderers/metadata-list-item"),
} satisfies Partial<Record<PuckComponentType, PublicRendererModuleLoader>>;

export async function loadAboutPublicRenderer(type: PuckComponentType): Promise<PublicRenderer> {
  const loader = ROUTE_PUBLIC_RENDERER_LOADERS[type as keyof typeof ROUTE_PUBLIC_RENDERER_LOADERS];
  if (!loader) {
    throw new Error(`About public renderer is stale for Puck component \"${type}\"`);
  }

  const rendererModule = await loader();
  return rendererModule.render;
}
