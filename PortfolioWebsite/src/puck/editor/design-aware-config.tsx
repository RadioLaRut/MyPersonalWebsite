"use client";

import { cloneElement, isValidElement, type ReactElement } from "react";
import type { Config } from "@puckeditor/core";

import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import type { ComponentDesignComponentKey } from "@/lib/component-design-schema";
import type { PuckComponentType } from "@/puck/component-manifest";

const DESIGN_KEY_BY_COMPONENT: Partial<
  Record<PuckComponentType, ComponentDesignComponentKey>
> = {
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
};

type GenericRenderProps = Record<string, unknown>;
type GenericRender = (props: GenericRenderProps) => ReactElement;

function DesignAwareRender({
  componentKey,
  render,
  renderProps,
}: {
  componentKey: ComponentDesignComponentKey;
  render: GenericRender;
  renderProps: GenericRenderProps;
}) {
  const design = useComponentDesign(componentKey);
  const rendered = render(renderProps);
  if (!isValidElement(rendered)) return rendered;

  return cloneElement(
    rendered as ReactElement<{ design?: unknown }>,
    { design },
  );
}

export function createDesignAwareEditorConfig(baseConfig: Config): Config {
  const components = Object.fromEntries(
    Object.entries(baseConfig.components).map(([type, component]) => {
      const componentKey = DESIGN_KEY_BY_COMPONENT[type as PuckComponentType];
      if (!componentKey) return [type, component];

      const render = component.render as unknown as GenericRender;
      return [
        type,
        {
          ...component,
          render: (renderProps: GenericRenderProps) => (
            <DesignAwareRender
              componentKey={componentKey}
              render={render}
              renderProps={renderProps}
            />
          ),
        },
      ];
    }),
  ) as Config["components"];

  return { ...baseConfig, components };
}
