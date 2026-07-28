import {
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import {
  getComponentLayoutGap,
  getComponentLayoutNodeClassName,
  getComponentLayoutNodeStyle,
  getResponsiveGapStyle,
} from "@/lib/component-design-style";
import type {
  ComponentLayoutNode as ComponentLayoutNodeValue,
  ComponentNodeTypography,
  ComponentResponsiveValue,
  ComponentVariantLayout,
} from "@/lib/component-design-v2";
import type {
  TypographyAlignment,
  TypographyAlignmentValue,
} from "@/lib/typography-alignment";

export type ComponentLayoutProps = {
  componentLayout?: ComponentVariantLayout;
  componentVariant?: string;
};

export function getComponentLayoutNode(
  layout: ComponentVariantLayout | undefined,
  nodeId: string,
): ComponentLayoutNodeValue | undefined {
  return layout?.nodes[nodeId];
}

export function getComponentLayoutTypography(
  layout: ComponentVariantLayout | undefined,
  nodeId: string,
): ComponentNodeTypography | {
  preset: ComponentResponsiveValue<ComponentNodeTypography["preset"]>;
  size: ComponentResponsiveValue<ComponentNodeTypography["size"]>;
  wrap: ComponentResponsiveValue<ComponentNodeTypography["wrap"]>;
} | undefined {
  const node = getComponentLayoutNode(layout, nodeId);
  if (!node?.responsiveTypography) return node?.typography;
  return {
    preset: {
      desktop: node.responsiveTypography.desktop.preset,
      mobile: node.responsiveTypography.mobile.preset,
      tablet: node.responsiveTypography.tablet.preset,
    },
    size: {
      desktop: node.responsiveTypography.desktop.size,
      mobile: node.responsiveTypography.mobile.size,
      tablet: node.responsiveTypography.tablet.size,
    },
    wrap: {
      desktop: node.responsiveTypography.desktop.wrap,
      mobile: node.responsiveTypography.mobile.wrap,
      tablet: node.responsiveTypography.tablet.wrap,
    },
  };
}

export function getComponentLayoutAlignment(
  layout: ComponentVariantLayout | undefined,
  nodeId: string,
  fallback: TypographyAlignmentValue = "left",
): TypographyAlignmentValue {
  return getComponentLayoutNode(layout, nodeId)?.alignment ?? fallback;
}

export function getComponentLayoutOpticalPull(
  layout: ComponentVariantLayout | undefined,
  nodeId: string,
): number {
  return getComponentLayoutNode(layout, nodeId)?.opticalPull ?? 0;
}

type ComponentLayoutBoxAlignmentStyle = CSSProperties & {
  "--component-box-align-desktop"?: string;
  "--component-box-align-mobile"?: string;
  "--component-box-align-tablet"?: string;
};

function toBoxAlignment(
  alignment: TypographyAlignment,
) {
  if (alignment === "center") return "center";
  if (alignment === "right") return "end";
  if (alignment === "justify") return "stretch";
  return "start";
}

export function getComponentLayoutBoxAlignmentStyle(
  layout: ComponentVariantLayout | undefined,
  nodeId: string,
): ComponentLayoutBoxAlignmentStyle | undefined {
  const alignment = getComponentLayoutNode(layout, nodeId)?.alignment;
  if (!alignment) return undefined;
  return {
    "--component-box-align-desktop": toBoxAlignment(alignment.desktop),
    "--component-box-align-mobile": toBoxAlignment(alignment.mobile),
    "--component-box-align-tablet": toBoxAlignment(alignment.tablet),
  };
}

export function getComponentLabNodeAttributes(
  layout: ComponentVariantLayout | undefined,
  nodeId: string,
  occurrence?: number,
) {
  return layout?.componentLabAnnotations
    ? {
      "data-component-lab-node": nodeId,
      ...(occurrence === undefined
        ? {}
        : { "data-component-lab-occurrence": occurrence }),
    }
    : {};
}

export default function ComponentLayoutNode({
  as,
  alignmentTarget,
  children,
  className,
  gapFrom,
  layout,
  nodeId,
  occurrence,
  style,
}: {
  as?: ElementType;
  alignmentTarget?: "box" | "text";
  children: ReactNode;
  className?: string;
  gapFrom?: string;
  layout?: ComponentVariantLayout;
  nodeId: string;
  occurrence?: number;
  style?: CSSProperties;
}) {
  const Component = as ?? "div";
  const node = getComponentLayoutNode(layout, nodeId);
  const gapStyle = gapFrom
    ? getResponsiveGapStyle(getComponentLayoutGap(layout, gapFrom, nodeId))
    : undefined;
  const nodeStyle = getComponentLayoutNodeStyle(node, layout?.section);
  const boxAlignmentStyle = alignmentTarget === "box"
    ? getComponentLayoutBoxAlignmentStyle(layout, nodeId)
    : undefined;

  return (
    <Component
      className={[
        getComponentLayoutNodeClassName(node),
        boxAlignmentStyle ? "component-layout-box-alignment" : "",
        gapStyle ? "component-layout-node-gap" : "",
        className ?? "",
      ].filter(Boolean).join(" ")}
      {...getComponentLabNodeAttributes(layout, nodeId, occurrence)}
      style={{ ...gapStyle, ...nodeStyle, ...boxAlignmentStyle, ...style }}
    >
      {children}
    </Component>
  );
}
