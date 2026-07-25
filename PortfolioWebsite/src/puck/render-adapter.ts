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
  ContactFlashlight: "ContactFlashlight",
  HeroHeadline: "HeroHeadline",
  HeroSection: "HeroSection",
  HomeEndcapSection: "HomeEndcapSection",
  ImagePanel: "ImagePanel",
  ImageSlider: "ImageSlider",
  NextProjectBlock: "NextProjectBlock",
  ParameterGrid: "ParameterGrid",
  RichParagraph: "RichParagraph",
  StatementBlock: "StatementBlock",
  WorksList: "WorksList",
  WorksListEntry: "WorksListEntry",
} as const satisfies Partial<Record<PuckComponentType, ComponentDesignComponentKey>>;

type GenericRenderProps = Record<string, unknown>;

export function resolveComponentDesignProps(
  type: PuckComponentType,
  designDocument?: ComponentDesignDocument,
): Record<string, unknown> | undefined {
  const componentKey = DESIGN_KEY_BY_COMPONENT[type as keyof typeof DESIGN_KEY_BY_COMPONENT];
  if (!designDocument) return undefined;

  if (type === "EditorialHeader") {
    return {
      collectionDesign: designDocument.components.LightingCollectionHeader,
      indexDesign: designDocument.components.PortfolioHeroHeader,
    };
  }
  if (type === "EditorialSplit") {
    return {
      cardDesign: designDocument.components.ContentCard,
      splitDesign: designDocument.components.TextSplitLayout,
    };
  }
  if (type === "ThreeColumnSection") {
    return {
      phaseDesign: designDocument.components.HighDensityInfoBlock,
      triptychDesign: designDocument.components.BreakdownTriptych,
    };
  }
  if (type === "ProjectCoverLink") {
    return {
      cardDesign: designDocument.components.LightingProjectCard,
      immersiveDesign: designDocument.components.ProjectSection,
    };
  }

  if (!componentKey) return undefined;

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
