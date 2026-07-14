"use client";

import type { Config } from "@puckeditor/core";

import { useComponentDesignDocument } from "@/components/layout/ComponentDesignProvider";
import type { PuckComponentType } from "@/puck/component-manifest";
import {
  DESIGN_KEY_BY_COMPONENT,
  renderWithAdapter,
} from "@/puck/render-adapter";

type GenericRenderProps = Record<string, unknown>;
function DesignAwareRender({
  render,
  renderProps,
  type,
}: {
  render: Config["components"][string]["render"];
  renderProps: GenericRenderProps;
  type: PuckComponentType;
}) {
  const designDocument = useComponentDesignDocument();
  return renderWithAdapter({
    designDocument,
    props: renderProps,
    render,
    surface: "editor",
    type,
  });
}

export function createDesignAwareEditorConfig(baseConfig: Config): Config {
  const components = Object.fromEntries(
    Object.entries(baseConfig.components).map(([type, component]) => {
      const componentKey = DESIGN_KEY_BY_COMPONENT[type as keyof typeof DESIGN_KEY_BY_COMPONENT];
      if (!componentKey) return [type, component];

      return [
        type,
        {
          ...component,
          render: (renderProps: GenericRenderProps) => (
            <DesignAwareRender
              render={component.render}
              renderProps={renderProps}
              type={type as PuckComponentType}
            />
          ),
        },
      ];
    }),
  ) as Config["components"];

  return { ...baseConfig, components };
}
