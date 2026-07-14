import type { ComponentConfig, Config } from "@puckeditor/core";
import { cloneElement, isValidElement, type ReactElement } from "react";

import type {
  ComponentDesignComponentKey,
  ComponentDesignDocument,
} from "@/lib/component-design-schema";
import type { PuckComponentType } from "@/puck/component-manifest";

export type RenderSurface = "public" | "editor" | "lab";

export const DESIGN_KEY_BY_COMPONENT = {
  BreakdownHeadline: "BreakdownHeadline",
  BreakdownTriptych: "BreakdownTriptych",
  ContactFlashlight: "ContactFlashlight",
  ContentCard: "ContentCard",
  HeroHeadline: "HeroHeadline",
  HeroSection: "HeroSection",
  HighDensityInfoBlock: "HighDensityInfoBlock",
  HomeEndcapSection: "HomeEndcapSection",
  ImagePanel: "ImagePanel",
  ImageSlider: "ImageSlider",
  LightingCollectionHeader: "LightingCollectionHeader",
  LightingProjectCard: "LightingProjectCard",
  NextProjectBlock: "NextProjectBlock",
  ParameterGrid: "ParameterGrid",
  PortfolioHeroHeader: "PortfolioHeroHeader",
  ProjectSection: "ProjectSection",
  RichParagraph: "RichParagraph",
  StatementBlock: "StatementBlock",
  TextSplitLayout: "TextSplitLayout",
  WorksList: "WorksList",
  WorksListEntry: "WorksListEntry",
} as const satisfies Partial<Record<PuckComponentType, ComponentDesignComponentKey>>;

type GenericRenderProps = Record<string, unknown>;

export function resolveComponentDesignProps(
  type: PuckComponentType,
  designDocument?: ComponentDesignDocument,
): Record<string, unknown> | undefined {
  const componentKey = DESIGN_KEY_BY_COMPONENT[type as keyof typeof DESIGN_KEY_BY_COMPONENT];
  if (!componentKey || !designDocument) return undefined;

  const design = designDocument.components[componentKey];
  if (type === "WorksList") {
    return {
      design,
      entryDesign: designDocument.components.WorksListEntry,
    };
  }

  return { design };
}

export function renderWithAdapter({
  designDocument,
  props,
  render,
  surface,
  type,
}: {
  designDocument?: ComponentDesignDocument;
  props?: GenericRenderProps;
  render: ComponentConfig["render"];
  surface: RenderSurface;
  type: PuckComponentType;
}) {
  const safeProps = props ?? {};
  const adaptedProps = {
    ...safeProps,
    editMode: surface !== "public",
  } as Parameters<ComponentConfig["render"]>[0];
  const rendered = render(adaptedProps);
  const designProps = resolveComponentDesignProps(type, designDocument);

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
