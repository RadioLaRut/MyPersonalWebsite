import type { CSSProperties } from "react";

import type {
  ComponentDesignOpticalPullToken,
  ComponentDesignSectionSpacingToken,
  ComponentDesignSpacingToken,
  ComponentGridBounds,
  ComponentResponsiveGridBounds,
} from "@/lib/component-design-schema";
import type {
  ComponentGridPlacement,
  ComponentLayoutNode,
  ComponentResponsiveValue,
  ComponentVariantLayout,
  ComponentDesignRhythmToken,
} from "@/lib/component-design-v2";

const SPACING_REM_MAP: Record<
  ComponentDesignSpacingToken | ComponentDesignOpticalPullToken,
  number
> = {
  "0": 0,
  "4": 0.25,
  "8": 0.5,
  "12": 0.75,
  "16": 1,
  "20": 1.25,
  "24": 1.5,
  "32": 2,
  "48": 3,
  "56": 3.5,
  "64": 4,
};

const GRID_START_CLASS_BY_COL = [
  "",
  "col-start-1",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
  "col-start-8",
  "col-start-9",
  "col-start-10",
  "col-start-11",
  "col-start-12",
] as const;

const GRID_SPAN_CLASS_BY_SPAN = [
  "",
  "col-span-1",
  "col-span-2",
  "col-span-3",
  "col-span-4",
  "col-span-5",
  "col-span-6",
  "col-span-7",
  "col-span-8",
  "col-span-9",
  "col-span-10",
  "col-span-11",
  "col-span-12",
] as const;

const GRID_LG_START_CLASS_BY_COL = [
  "",
  "lg:col-start-1",
  "lg:col-start-2",
  "lg:col-start-3",
  "lg:col-start-4",
  "lg:col-start-5",
  "lg:col-start-6",
  "lg:col-start-7",
  "lg:col-start-8",
  "lg:col-start-9",
  "lg:col-start-10",
  "lg:col-start-11",
  "lg:col-start-12",
] as const;

const GRID_MD_START_CLASS_BY_COL = [
  "",
  "md:col-start-1",
  "md:col-start-2",
  "md:col-start-3",
  "md:col-start-4",
  "md:col-start-5",
  "md:col-start-6",
  "md:col-start-7",
  "md:col-start-8",
  "md:col-start-9",
  "md:col-start-10",
  "md:col-start-11",
  "md:col-start-12",
] as const;

const GRID_MD_SPAN_CLASS_BY_SPAN = [
  "",
  "md:col-span-1",
  "md:col-span-2",
  "md:col-span-3",
  "md:col-span-4",
  "md:col-span-5",
  "md:col-span-6",
  "md:col-span-7",
  "md:col-span-8",
  "md:col-span-9",
  "md:col-span-10",
  "md:col-span-11",
  "md:col-span-12",
] as const;

const GRID_LG_SPAN_CLASS_BY_SPAN = [
  "",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-4",
  "lg:col-span-5",
  "lg:col-span-6",
  "lg:col-span-7",
  "lg:col-span-8",
  "lg:col-span-9",
  "lg:col-span-10",
  "lg:col-span-11",
  "lg:col-span-12",
] as const;

function getGridSpan(bounds: ComponentGridBounds) {
  return bounds.rightCol - bounds.leftCol + 1;
}

export function getSpacingRem(
  token: ComponentDesignSpacingToken | ComponentDesignOpticalPullToken,
): string {
  return `${SPACING_REM_MAP[token]}rem`;
}

export function getGridColumnStyle(bounds: ComponentGridBounds): CSSProperties {
  return {
    gridColumn: `${bounds.leftCol} / ${bounds.rightCol + 1}`,
  };
}

export function getGridColumnClassName(bounds: ComponentGridBounds): string {
  const span = getGridSpan(bounds);
  return `${GRID_START_CLASS_BY_COL[bounds.leftCol]} ${GRID_SPAN_CLASS_BY_SPAN[span]}`;
}

export function createResponsiveGridBounds(
  base: ComponentGridBounds,
  md: ComponentGridBounds = base,
  lg: ComponentGridBounds = md,
): ComponentResponsiveGridBounds {
  return { base, md, lg };
}

export function getResponsiveGridColumnClassName(
  bounds: ComponentResponsiveGridBounds,
): string {
  const mdSpan = getGridSpan(bounds.md);
  const lgSpan = getGridSpan(bounds.lg);
  return `${getGridColumnClassName(bounds.base)} ${GRID_MD_START_CLASS_BY_COL[bounds.md.leftCol]} ${GRID_MD_SPAN_CLASS_BY_SPAN[mdSpan]} ${GRID_LG_START_CLASS_BY_COL[bounds.lg.leftCol]} ${GRID_LG_SPAN_CLASS_BY_SPAN[lgSpan]}`;
}

export function getGridSpanClassName(span: number): string {
  if (span < 1 || span > 12) {
    return "col-span-12";
  }

  return GRID_SPAN_CLASS_BY_SPAN[span];
}

export function getSectionSpacingClassName(
  token: ComponentDesignSectionSpacingToken,
): string {
  switch (token) {
    case "section-normal":
      return "rhythm-section-normal";
    case "section-spacious":
      return "rhythm-section-spacious";
    case "block":
      return "rhythm-block";
    case "block-compact":
      return "rhythm-block-compact";
    default:
      return "rhythm-block";
  }
}

function getPlacementClassName(
  placement: ComponentGridPlacement,
): string {
  return `${GRID_START_CLASS_BY_COL[placement.start]} ${GRID_SPAN_CLASS_BY_SPAN[placement.span]}`;
}

export function getResponsiveGridPlacementClassName(
  placement: ComponentResponsiveValue<ComponentGridPlacement>,
): string {
  return [
    getPlacementClassName(placement.mobile),
    GRID_MD_START_CLASS_BY_COL[placement.tablet.start],
    GRID_MD_SPAN_CLASS_BY_SPAN[placement.tablet.span],
    GRID_LG_START_CLASS_BY_COL[placement.desktop.start],
    GRID_LG_SPAN_CLASS_BY_SPAN[placement.desktop.span],
  ].join(" ");
}

export function getComponentLayoutNodeClassName(
  node: ComponentLayoutNode | undefined,
): string {
  return node ? getResponsiveGridPlacementClassName(node.placement) : "";
}

type ResponsiveGapStyle = CSSProperties & {
  "--component-gap-desktop"?: string;
  "--component-gap-mobile"?: string;
  "--component-gap-tablet"?: string;
};

export function getResponsiveGapStyle(
  value: ComponentResponsiveValue<ComponentDesignRhythmToken> | undefined,
): ResponsiveGapStyle | undefined {
  if (!value) return undefined;
  return {
    "--component-gap-desktop": `${value.desktop}px`,
    "--component-gap-mobile": `${value.mobile}px`,
    "--component-gap-tablet": `${value.tablet}px`,
  };
}

export function getComponentLayoutGap(
  layout: ComponentVariantLayout | undefined,
  from: string,
  to: string,
) {
  return layout?.gaps[`${from}>${to}`];
}

export function getComponentSectionProfileClassName(
  layout: ComponentVariantLayout | undefined,
): string {
  return layout
    ? `component-section-profile component-section-profile--${layout.sectionProfile}`
    : "";
}
