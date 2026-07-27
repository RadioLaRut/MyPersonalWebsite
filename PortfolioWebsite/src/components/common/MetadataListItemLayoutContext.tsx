"use client";

import React, {
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";

import {
  getComponentLabNodeAttributes,
  getComponentLayoutNode,
} from "@/components/common/ComponentLayoutNode";
import {
  getComponentLayoutGap,
  getComponentLayoutNodeClassName,
  getComponentLayoutNodeStyle,
  getResponsiveGapStyle,
} from "@/lib/component-design-style";
import type { ComponentVariantLayout } from "@/lib/component-design-v2";

type MetadataListLayoutScope = {
  firstGapFrom: string;
  labelNodeId: string;
  layout: ComponentVariantLayout;
  valueNodeId: string;
};

export type MetadataListItemLayout = MetadataListLayoutScope & {
  occurrence: number;
};

const MetadataListLayoutScopeContext =
  React.createContext<MetadataListLayoutScope | null>(null);
const MetadataListItemLayoutContext =
  React.createContext<MetadataListItemLayout | null>(null);

export function MetadataListItemLayoutProvider({
  children,
  firstGapFrom,
  labelNodeId,
  layout,
  valueNodeId,
}: MetadataListLayoutScope & { children: ReactNode }) {
  return (
    <MetadataListLayoutScopeContext.Provider
      value={{ firstGapFrom, labelNodeId, layout, valueNodeId }}
    >
      {children}
    </MetadataListLayoutScopeContext.Provider>
  );
}

export function MetadataListItemSlotRoot({
  children,
  className,
  style,
  ...rootProps
}: ComponentPropsWithRef<"div">) {
  const scope = React.useContext(MetadataListLayoutScopeContext);
  const items = React.Children.toArray(children);
  const isPuckEditor = Boolean(
    (rootProps as Record<string, unknown>)["data-puck-dropzone"],
  );

  return (
    <div
      {...rootProps}
      className={isPuckEditor ? className : "contents"}
      style={isPuckEditor ? style : undefined}
    >
      {items.map((child, occurrence) => {
        const item = scope ? { ...scope, occurrence } : null;
        const key = React.isValidElement(child) && child.key !== null
          ? child.key
          : occurrence;
        return (
          <MetadataListItemLayoutContext.Provider key={key} value={item}>
            {child}
          </MetadataListItemLayoutContext.Provider>
        );
      })}
    </div>
  );
}

export function useMetadataListItemLayout() {
  return React.useContext(MetadataListItemLayoutContext);
}

export function MetadataListItemLayoutNode({
  children,
  role,
}: {
  children: ReactNode;
  role: "label" | "value";
}) {
  const item = useMetadataListItemLayout();
  if (!item) return children;

  const nodeId = role === "label" ? item.labelNodeId : item.valueNodeId;
  const gapFrom = role === "value"
    ? item.labelNodeId
    : item.occurrence === 0
      ? item.firstGapFrom
      : item.valueNodeId;
  const node = getComponentLayoutNode(item.layout, nodeId);
  const gapStyle = getResponsiveGapStyle(
    getComponentLayoutGap(item.layout, gapFrom, nodeId),
  );
  const nodeStyle = getComponentLayoutNodeStyle(node, item.layout.section);

  return (
    <div
      className={[
        getComponentLayoutNodeClassName(node),
        gapStyle ? "component-layout-node-gap" : "",
      ].filter(Boolean).join(" ")}
      {...getComponentLabNodeAttributes(
        item.layout,
        nodeId,
        item.occurrence,
      )}
      style={{ ...gapStyle, ...nodeStyle }}
    >
      {children}
    </div>
  );
}
