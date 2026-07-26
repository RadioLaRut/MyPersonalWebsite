import {
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import {
  getComponentLayoutGap,
  getComponentLayoutNodeClassName,
  getResponsiveGapStyle,
} from "@/lib/component-design-style";
import type {
  ComponentLayoutNode as ComponentLayoutNodeValue,
  ComponentVariantLayout,
} from "@/lib/component-design-v2";
import type {
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
) {
  return getComponentLayoutNode(layout, nodeId)?.typography;
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

export default function ComponentLayoutNode({
  as,
  children,
  className,
  gapFrom,
  layout,
  nodeId,
  style,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  gapFrom?: string;
  layout?: ComponentVariantLayout;
  nodeId: string;
  style?: CSSProperties;
}) {
  const Component = as ?? "div";
  const node = getComponentLayoutNode(layout, nodeId);
  const gapStyle = gapFrom
    ? getResponsiveGapStyle(getComponentLayoutGap(layout, gapFrom, nodeId))
    : undefined;

  return (
    <Component
      className={[
        getComponentLayoutNodeClassName(node),
        gapStyle ? "component-layout-node-gap" : "",
        className ?? "",
      ].filter(Boolean).join(" ")}
      data-component-lab-node={nodeId}
      style={{ ...gapStyle, ...style }}
    >
      {children}
    </Component>
  );
}
