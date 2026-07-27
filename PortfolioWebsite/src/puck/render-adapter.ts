import type { ComponentConfig, Config } from "@puckeditor/core";
import { cloneElement, isValidElement, type ReactElement } from "react";

import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  type ComponentDesignAuthorComponent,
} from "../lib/component-design-manifest.ts";
import {
  getComponentVariantLayout,
  resolveComponentDesignVariant,
  type ComponentDesignDocument,
} from "../lib/component-design-v2.ts";
import type { PublicMediaHint } from "../lib/media-layout.ts";
import type { PuckComponentType } from "./component-manifest.ts";

export type RenderSurface = "public" | "editor" | "lab";

type GenericRenderProps = Record<string, unknown>;

function isAuthorComponent(
  type: PuckComponentType,
): type is ComponentDesignAuthorComponent {
  return (COMPONENT_DESIGN_AUTHOR_COMPONENTS as readonly string[]).includes(type);
}

export function resolveComponentDesignProps(
  type: PuckComponentType,
  props: GenericRenderProps = {},
  designDocument?: ComponentDesignDocument,
  surface: RenderSurface = "public",
): Record<string, unknown> | undefined {
  if (!designDocument) return undefined;
  const componentLayout = isAuthorComponent(type)
    ? getComponentVariantLayout(designDocument, type, props)
    : type === "WorksListEntry"
      ? designDocument.components.WorksList.variants.default
    : undefined;
  const componentVariant = isAuthorComponent(type)
    ? resolveComponentDesignVariant(type, props)
    : type === "WorksListEntry"
      ? "default"
    : undefined;
  const surfaceLayout = componentLayout && surface === "lab"
    ? { ...componentLayout, componentLabAnnotations: true as const }
    : componentLayout;
  return surfaceLayout
    ? { componentLayout: surfaceLayout, componentVariant }
    : undefined;
}

export function renderWithAdapter({
  designDocument,
  props,
  render,
  publicMediaHint,
  surface,
  type,
}: {
  designDocument?: ComponentDesignDocument;
  props?: GenericRenderProps;
  render: ComponentConfig["render"];
  publicMediaHint?: PublicMediaHint;
  surface: RenderSurface;
  type: PuckComponentType;
}) {
  const safeProps = props ?? {};
  const adaptedProps = {
    ...safeProps,
    editMode: surface !== "public",
    ...(publicMediaHint ? { publicMediaHint } : {}),
  } as Parameters<ComponentConfig["render"]>[0];
  const rendered = render(adaptedProps);
  const designProps = resolveComponentDesignProps(
    type,
    safeProps,
    designDocument,
    surface,
  );

  if (!designProps || !isValidElement(rendered)) return rendered;

  return cloneElement(
    rendered as ReactElement<Record<string, unknown>>,
    designProps,
  );
}

export function createStaticSurfaceConfig(
  baseConfig: Config,
  {
    designDocument,
    surface,
  }: {
    designDocument?: ComponentDesignDocument;
    surface: RenderSurface;
  },
): Config {
  const components = Object.fromEntries(
    Object.entries(baseConfig.components).map(([rawType, component]) => {
      const type = rawType as PuckComponentType;
      return [
        type,
        {
          ...component,
          render: (props: GenericRenderProps) => renderWithAdapter({
            designDocument,
            props,
            render: component.render,
            surface,
            type,
          }),
        },
      ];
    }),
  ) as Config["components"];

  return { ...baseConfig, components };
}
