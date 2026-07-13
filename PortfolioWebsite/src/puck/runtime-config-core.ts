import type { ComponentConfig, Config } from "@puckeditor/core";
import { cloneElement, type ReactElement } from "react";

import type { ComponentDesignDocument } from "../lib/component-design-schema.ts";
import type { PageDocument } from "../lib/page-document-contract.ts";
import type { PuckComponentType } from "./component-manifest.ts";
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

function resolveComponentDesignProps(
  type: PuckComponentType,
  designDocument: ComponentDesignDocument | undefined,
) {
  if (!designDocument || !(type in designDocument.components)) return undefined;
  const design = designDocument.components[
    type as keyof ComponentDesignDocument["components"]
  ];

  if (type === "WorksList") {
    return {
      design,
      entryDesign: designDocument.components.WorksListEntry,
    };
  }

  return { design };
}

function injectComponentDesign(
  renderer: ComponentConfig["render"],
  designProps: Record<string, unknown>,
): ComponentConfig["render"] {
  return (props) => cloneElement(
    renderer(props) as ReactElement<Record<string, unknown>>,
    designProps,
  );
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

      const designProps = resolveComponentDesignProps(type, designDocument);
      const render = designProps
        ? injectComponentDesign(loadedRenderer, designProps)
        : loadedRenderer;
      return [type, { render }] as const;
    })),
  );

  return { components };
}
