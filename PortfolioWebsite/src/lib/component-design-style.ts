import type { CSSProperties } from "react";

import type {
  ComponentDesignSectionSpacingToken,
  ComponentDesignSpacingToken,
  ComponentGridBounds,
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
