import type { ComponentConfig, Config } from "@puckeditor/core";

import type { ComponentDesignDocument } from "../lib/component-design-schema.ts";
import type { PageDocument } from "../lib/page-document-contract.ts";
import type { PuckComponentType } from "./component-manifest.ts";
import { renderWithAdapter } from "./render-adapter.ts";
import { collectPuckComponentTypes } from "./runtime-component-types.ts";

export type PublicRendererLoader = (
  type: PuckComponentType,
) => Promise<ComponentConfig["render"]>;

export type PublicRuntimeConfigOptions = {
  designDocument?: ComponentDesignDocument;
  loadRenderer: PublicRendererLoader;
};

type PublicRuntimeEnvironment = {
  nodeEnv?: string;
  siteMode?: string;
};

export function shouldUseCompletePublicRendererRegistry({
  nodeEnv = process.env.NODE_ENV,
  siteMode = process.env.NEXT_PUBLIC_SITE_MODE,
}: PublicRuntimeEnvironment = {}) {
  return nodeEnv === "development" && siteMode === "testing";
}

async function resolvePublicRendererLoader(routeLoader: PublicRendererLoader) {
  if (!shouldUseCompletePublicRendererRegistry()) {
    return routeLoader;
  }

  const { loadPublicRenderer } = await import("./public-renderer-loaders.ts");
  return loadPublicRenderer;
}

function createPublicAdapter(
  type: PuckComponentType,
  renderer: ComponentConfig["render"],
  designDocument?: ComponentDesignDocument,
): ComponentConfig["render"] {
  return (props) => renderWithAdapter({
    designDocument,
    props,
    render: renderer,
    surface: "public",
    type,
  });
}

export async function createPublicRuntimeConfig(
  document: PageDocument,
  { designDocument, loadRenderer }: PublicRuntimeConfigOptions,
): Promise<Config> {
  const usedTypes = collectPuckComponentTypes(document);
  const activeLoader = await resolvePublicRendererLoader(loadRenderer);
  const components = Object.fromEntries(
    await Promise.all([...usedTypes].map(async (type) => {
      const loadedRenderer = await activeLoader(type);
      if (typeof loadedRenderer !== "function") {
        throw new Error(`Missing public renderer for Puck component "${type}"`);
      }

      const render = createPublicAdapter(type, loadedRenderer, designDocument);
      return [type, { render }] as const;
    })),
  );

  return { components };
}
