// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。
import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "../component-manifest.ts";

type PublicRenderer = ComponentConfig["render"];
type PublicRendererModule = { render: PublicRenderer };
type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;

export const HOME_PUBLIC_RENDERER_TYPES = [
  "HeroSection",
  "ProjectCoverLink",
  "HomeEndcapSection",
] as const satisfies readonly PuckComponentType[];

const ROUTE_PUBLIC_RENDERER_LOADERS = {
  HeroSection: () => import("../public-renderers/hero-section"),
  ProjectCoverLink: () => import("../public-renderers/project-cover-link"),
  HomeEndcapSection: () => import("../public-renderers/home-endcap-section"),
} satisfies Partial<Record<PuckComponentType, PublicRendererModuleLoader>>;

export async function loadHomePublicRenderer(type: PuckComponentType): Promise<PublicRenderer> {
  const loader = ROUTE_PUBLIC_RENDERER_LOADERS[type as keyof typeof ROUTE_PUBLIC_RENDERER_LOADERS];
  if (!loader) {
    throw new Error(`Homepage public renderer is stale for Puck component \"${type}\"`);
  }

  const rendererModule = await loader();
  return rendererModule.render;
}
