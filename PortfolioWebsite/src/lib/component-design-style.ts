import type { CSSProperties } from "react";

import type {
  ComponentDesignOpticalPullToken,
  ComponentDesignSectionSpacingToken,
  ComponentDesignSpacingToken,
  ComponentGridBounds,
  ComponentResponsiveGridBounds,
} from "@/lib/component-design-schema";
import type {
  ComponentDesignRuntimeMediaFrame,
  ComponentDesignRuntimeNodePositioning,
  ComponentDesignRuntimeSectionHeight,
  ComponentDesignRuntimeSectionLayout,
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
  if (!node) return "";
  const positioning = node.positioning
    ? Object.values(node.positioning)
    : [];
  const hasFlowPositioning = positioning.some(
    (value) => value.mode === "flow",
  );
  const hasActiveOverlayPositioning = positioning.some(
    (value) =>
      value.mode === "overlay" &&
      (
        value.anchored === true ||
        value.anchor !== "center" ||
        value.offset !== 0
      ),
  );
  const hasMediaFrame = node.mediaFrame
    ? Object.values(node.mediaFrame).some((frame) => frame !== "auto")
    : false;

  return [
    getResponsiveGridPlacementClassName(node.placement),
    hasFlowPositioning
      ? "component-layout-node-positioning component-layout-node-positioning--flow"
      : "",
    hasActiveOverlayPositioning
      ? "component-layout-node-positioning component-layout-node-positioning--overlay"
      : "",
    hasMediaFrame ? "component-layout-node-media-frame" : "",
  ].filter(Boolean).join(" ");
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

type ComponentLayoutNodeStyle = CSSProperties & {
  "--component-media-aspect-desktop"?: string;
  "--component-media-aspect-mobile"?: string;
  "--component-media-aspect-tablet"?: string;
  "--component-media-child-aspect-desktop"?: string;
  "--component-media-child-aspect-mobile"?: string;
  "--component-media-child-aspect-tablet"?: string;
  "--component-media-child-height-desktop"?: string;
  "--component-media-child-height-mobile"?: string;
  "--component-media-child-height-tablet"?: string;
  "--component-media-min-height-desktop"?: string;
  "--component-media-min-height-mobile"?: string;
  "--component-media-min-height-tablet"?: string;
  "--component-node-gap-desktop"?: string;
  "--component-node-gap-mobile"?: string;
  "--component-node-gap-tablet"?: string;
  "--component-node-order-desktop"?: string;
  "--component-node-order-mobile"?: string;
  "--component-node-order-tablet"?: string;
  "--component-node-position-desktop"?: string;
  "--component-node-position-mobile"?: string;
  "--component-node-position-tablet"?: string;
  "--component-node-top-desktop"?: string;
  "--component-node-top-mobile"?: string;
  "--component-node-top-tablet"?: string;
  "--component-node-translate-desktop"?: string;
  "--component-node-translate-mobile"?: string;
  "--component-node-translate-tablet"?: string;
};

function getOverlayPositionStyle(
  positioning: Extract<
    ComponentDesignRuntimeNodePositioning,
    { mode: "overlay" }
  >,
) {
  if (
    positioning.anchored !== true &&
    positioning.anchor === "center" &&
    positioning.offset === 0
  ) {
    return {
      position: "relative",
      top: "auto",
      translate: "0 0",
    };
  }

  const anchorTop = positioning.anchor === "top"
    ? "0%"
    : positioning.anchor === "center"
      ? "50%"
      : "100%";
  const anchorTranslate = positioning.anchor === "top"
    ? 0
    : positioning.anchor === "center"
      ? -50
      : -100;
  const translate = positioning.offset === 0
    ? `0 ${anchorTranslate}%`
    : `0 calc(${anchorTranslate}% + ${positioning.offset}px)`;

  return {
    position: "absolute",
    top: anchorTop,
    translate,
  };
}

function getMediaFrameStyle(frame: ComponentDesignRuntimeMediaFrame) {
  switch (frame) {
    case "square":
      return { aspect: "1 / 1", childAspect: "auto", childHeight: "100%" };
    case "portrait":
      return { aspect: "3 / 4", childAspect: "auto", childHeight: "100%" };
    case "landscape":
      return { aspect: "4 / 3", childAspect: "auto", childHeight: "100%" };
    case "wide":
      return { aspect: "16 / 9", childAspect: "auto", childHeight: "100%" };
    case "cinematic":
      return { aspect: "21 / 9", childAspect: "auto", childHeight: "100%" };
    case "viewport":
      return {
        aspect: "auto",
        childAspect: "auto",
        childHeight: "100%",
        minHeight: "calc(var(--site-viewport-unit) * 100)",
      };
    case "auto":
    default:
      return null;
  }
}

function getSectionGap(
  section: ComponentResponsiveValue<ComponentDesignRuntimeSectionLayout> | undefined,
  breakpoint: keyof ComponentResponsiveValue<unknown>,
  positioning: ComponentDesignRuntimeNodePositioning,
) {
  return positioning.mode === "flow" && positioning.order > 0
    ? (section?.[breakpoint].gap ?? 0)
    : 0;
}

export function getComponentLayoutNodeStyle(
  node: ComponentLayoutNode | undefined,
  section?: ComponentResponsiveValue<ComponentDesignRuntimeSectionLayout>,
): ComponentLayoutNodeStyle | undefined {
  if (!node?.positioning && !node?.mediaFrame) return undefined;
  const style: ComponentLayoutNodeStyle = {};
  const breakpoints = ["mobile", "tablet", "desktop"] as const;

  for (const breakpoint of breakpoints) {
    const positioning = node.positioning?.[breakpoint];
    if (positioning?.mode === "flow") {
      style[`--component-node-gap-${breakpoint}`] =
        `${positioning.gapBefore + getSectionGap(section, breakpoint, positioning)}px`;
      style[`--component-node-order-${breakpoint}`] =
        String(positioning.order);
    } else if (positioning?.mode === "overlay") {
      const overlay = getOverlayPositionStyle(positioning);
      style[`--component-node-position-${breakpoint}`] = overlay.position;
      style[`--component-node-top-${breakpoint}`] = overlay.top;
      style[`--component-node-translate-${breakpoint}`] = overlay.translate;
    }

    const media = node.mediaFrame
      ? getMediaFrameStyle(node.mediaFrame[breakpoint])
      : null;
    if (media) {
      style[`--component-media-aspect-${breakpoint}`] = media.aspect;
      style[`--component-media-child-aspect-${breakpoint}`] =
        media.childAspect;
      style[`--component-media-child-height-${breakpoint}`] =
        media.childHeight;
      if (media.minHeight) {
        style[`--component-media-min-height-${breakpoint}`] =
          media.minHeight;
      }
    }
  }

  return Object.keys(style).length > 0 ? style : undefined;
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
  if (!layout) return "";
  const hasCustomHeight = layout.section
    ? Object.values(layout.section).some(({ height }) => height !== "auto")
    : false;
  return [
    "component-section-profile",
    `component-section-profile--${layout.sectionProfile}`,
    hasCustomHeight ? "component-section-profile--custom-height" : "",
  ].filter(Boolean).join(" ");
}

type ComponentSectionStyle = CSSProperties & {
  "--component-section-bottom-desktop"?: string;
  "--component-section-bottom-mobile"?: string;
  "--component-section-bottom-tablet"?: string;
  "--component-section-height-desktop"?: string;
  "--component-section-height-mobile"?: string;
  "--component-section-height-tablet"?: string;
  "--component-section-top-desktop"?: string;
  "--component-section-top-mobile"?: string;
  "--component-section-top-tablet"?: string;
};

function getSectionMinHeight(
  height: ComponentDesignRuntimeSectionHeight,
): string | undefined {
  switch (height) {
    case "compact":
      return "clamp(20rem, calc(var(--site-viewport-unit) * 45), 30rem)";
    case "normal":
      return "clamp(30rem, calc(var(--site-viewport-unit) * 68), 48rem)";
    case "tall":
      return "clamp(40rem, calc(var(--site-viewport-unit) * 84), 60rem)";
    case "viewport":
      return "calc(var(--site-viewport-unit) * 100)";
    case "auto":
    default:
      return undefined;
  }
}

export function getComponentSectionStyle(
  layout: ComponentVariantLayout | undefined,
): ComponentSectionStyle | undefined {
  if (!layout?.section) return undefined;
  const style: ComponentSectionStyle = {};
  const breakpoints = ["mobile", "tablet", "desktop"] as const;

  for (const breakpoint of breakpoints) {
    const section = layout.section[breakpoint];
    style[`--component-section-bottom-${breakpoint}`] =
      `${section.paddingBottom}px`;
    style[`--component-section-top-${breakpoint}`] =
      `${section.paddingTop}px`;
    const minHeight = getSectionMinHeight(section.height);
    if (minHeight) {
      style[`--component-section-height-${breakpoint}`] = minHeight;
    }
  }

  return style;
}
