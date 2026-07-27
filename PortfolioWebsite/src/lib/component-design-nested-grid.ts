import type {
  ComponentGridPlacement,
  ComponentVariantLayout,
} from "./component-design-v2.ts";

export function mapPlacementToNestedTwelveColumnGrid(
  parent: ComponentGridPlacement,
  child: ComponentGridPlacement,
): ComponentGridPlacement {
  const parentEnd = parent.start + parent.span;
  const childStart = Math.max(
    parent.start,
    Math.min(parentEnd - 1, child.start),
  );
  const childEnd = Math.max(
    childStart + 1,
    Math.min(parentEnd, child.start + child.span),
  );
  const start = Math.min(
    12,
    Math.max(
      1,
      Math.round(((childStart - parent.start) / parent.span) * 12) + 1,
    ),
  );
  const end = Math.min(
    13,
    Math.max(
      start + 1,
      Math.round(((childEnd - parent.start) / parent.span) * 12) + 1,
    ),
  );

  return { span: end - start, start };
}

export function createNestedComponentVariantLayout(
  layout: ComponentVariantLayout,
  parentNodeId: string,
): ComponentVariantLayout {
  const parent = layout.nodes[parentNodeId];
  if (!parent) return layout;

  const descendantPrefix = `${parentNodeId}.`;
  const nodes = Object.fromEntries(
    Object.entries(layout.nodes).map(([nodeId, node]) => {
      if (!nodeId.startsWith(descendantPrefix)) return [nodeId, node];

      return [
        nodeId,
        {
          ...node,
          placement: {
            desktop: mapPlacementToNestedTwelveColumnGrid(
              parent.placement.desktop,
              node.placement.desktop,
            ),
            mobile: mapPlacementToNestedTwelveColumnGrid(
              parent.placement.mobile,
              node.placement.mobile,
            ),
            tablet: mapPlacementToNestedTwelveColumnGrid(
              parent.placement.tablet,
              node.placement.tablet,
            ),
          },
        },
      ];
    }),
  );

  return { ...layout, nodes };
}
