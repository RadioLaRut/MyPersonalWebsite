import type { CSSProperties } from "react";

import type {
  ComponentDesignSectionSpacingToken,
  ComponentDesignSpacingToken,
  ComponentGridBounds,
  ComponentResponsiveGridBounds,
} from "@/lib/component-design-schema";

const SPACING_REM_MAP: Record<ComponentDesignSpacingToken, number> = {
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
  token: ComponentDesignSpacingToken,
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

export function getResponsiveGridColumnClassName(
  bounds: ComponentResponsiveGridBounds,
): string {
  const lgSpan = getGridSpan(bounds.lg);
  return `${getGridColumnClassName(bounds.base)} ${GRID_LG_START_CLASS_BY_COL[bounds.lg.leftCol]} ${GRID_LG_SPAN_CLASS_BY_SPAN[lgSpan]}`;
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
