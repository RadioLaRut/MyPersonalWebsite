import React, {
  Fragment,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";

import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import {
  MetadataListItemLayoutProvider,
  MetadataListItemSlotRoot,
} from "@/components/common/MetadataListItemLayoutContext";
import { PresetImage } from "@/components/common/PresetImage";
import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import { createNestedComponentVariantLayout } from "@/lib/component-design-nested-grid";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  createResponsiveGridBounds,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";

interface InfoItem {
  label: ReactNode;
  value: ReactNode;
}

type HighDensityInfoBlockProps = {
  phase1: {
    title: ReactNode;
    subtitle?: ReactNode;
    content: ReactNode;
    bodyAlign?: TypographyAlignment;
    items?: InfoItem[];
    label?: ReactNode;
  };
  phase2: {
    title: ReactNode;
    subtitle?: ReactNode;
    content: ReactNode;
    bodyAlign?: TypographyAlignment;
    items?: InfoItem[];
    label?: ReactNode;
  };
  phase3: {
    title: ReactNode;
    subtitle?: ReactNode;
    content: ReactNode;
    bodyAlign?: TypographyAlignment;
    imageSrc?: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
    label?: ReactNode;
  };
  phase1ItemsContent?: ReactNode;
  phase2ItemsContent?: ReactNode;
  rhythm?: "aligned" | "staggered";
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"HighDensityInfoBlock"> & ComponentLayoutProps;

const DEFAULT_PHASE_LABELS = {
  phase1: "PHASE 01 / CONTEXT",
  phase2: "PHASE 02 / SYSTEM ARCHITECTURE",
  phase3: "PHASE 03 / EXECUTION & RESULTS",
} as const;

type SlotElementProps = {
  allow?: readonly string[];
  as?: ElementType;
  className?: string;
  minEmptyHeight?: CSSProperties["minHeight"] | number;
  style?: CSSProperties;
};

function isPuckSlotElement(
  node: ReactNode,
): node is ReactElement<SlotElementProps> {
  if (!React.isValidElement(node) || typeof node.type === "string") {
    return false;
  }
  const props = node.props as SlotElementProps;
  return props.allow !== undefined || props.minEmptyHeight !== undefined;
}

export default function HighDensityInfoBlock({
  phase1,
  phase2,
  phase3,
  phase1ItemsContent,
  phase2ItemsContent,
  componentLayout,
  rhythm = "aligned",
  publicMediaHint,
  design,
}: HighDensityInfoBlockProps) {
  const resolvedDesign = resolveComponentDesign("HighDensityInfoBlock", design);
  const phase3ImageAlt = toPlainText(phase3.title) ?? "Phase image";
  const phases = [
    {
      ...phase1,
      itemsContent: phase1ItemsContent,
      label: hasEditableTextContent(phase1.label)
        ? phase1.label
        : DEFAULT_PHASE_LABELS.phase1,
    },
    {
      ...phase2,
      itemsContent: phase2ItemsContent,
      label: hasEditableTextContent(phase2.label)
        ? phase2.label
        : DEFAULT_PHASE_LABELS.phase2,
    },
    {
      ...phase3,
      itemsContent: undefined,
      label: hasEditableTextContent(phase3.label)
        ? phase3.label
        : DEFAULT_PHASE_LABELS.phase3,
    },
  ];
  const sectionClassName = componentLayout
    ? getComponentSectionProfileClassName(componentLayout)
    : getSectionSpacingClassName(resolvedDesign.sectionSpacing);

  return (
    <section
      className={`w-full ${sectionClassName}`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="grid-container border-t border-white/20 rhythm-divider-top">
        {phases.map((phase, phaseIndex) => {
          const column = phaseIndex + 1;
          const prefix = `column${column}`;
          const columnLayout = componentLayout
            ? createNestedComponentVariantLayout(componentLayout, prefix)
            : undefined;
          const labelTypography = getComponentLayoutTypography(
            componentLayout,
            `${prefix}.label`,
          );
          const titleTypography = getComponentLayoutTypography(
            componentLayout,
            `${prefix}.title`,
          );
          const subtitleTypography = getComponentLayoutTypography(
            componentLayout,
            `${prefix}.subtitle`,
          );
          const bodyTypography = getComponentLayoutTypography(
            componentLayout,
            `${prefix}.body`,
          );
          const itemLabelTypography = getComponentLayoutTypography(
            componentLayout,
            `${prefix}.item.label`,
          );
          const itemValueTypography = getComponentLayoutTypography(
            componentLayout,
            `${prefix}.item.value`,
          );
          const items = "items" in phase ? phase.items : undefined;
          const imageSrc = "imageSrc" in phase ? phase.imageSrc : undefined;
          const itemGapFrom = hasEditableTextContent(phase.content)
            ? `${prefix}.body`
            : hasEditableTextContent(phase.subtitle)
              ? `${prefix}.subtitle`
              : `${prefix}.title`;
          const fallbackBounds = phaseIndex === 0
            ? createResponsiveGridBounds(
              { leftCol: 1, rightCol: 12 },
              { leftCol: 1, rightCol: 6 },
              resolvedDesign.leftBounds,
            )
            : phaseIndex === 1
              ? createResponsiveGridBounds(
                { leftCol: 1, rightCol: 12 },
                { leftCol: 7, rightCol: 12 },
                resolvedDesign.middleBounds,
              )
              : createResponsiveGridBounds(
                { leftCol: 1, rightCol: 12 },
                { leftCol: 1, rightCol: 12 },
                resolvedDesign.rightBounds,
              );
          const fallbackStagger = !componentLayout && rhythm === "staggered"
            ? phaseIndex === 1
              ? "lg:pt-8"
              : phaseIndex === 2
                ? "lg:pt-16"
                : ""
            : "";
          const childFallbackClassName = columnLayout
            ? undefined
            : "col-span-12";

          return (
            <ComponentLayoutNode
              key={prefix}
              className={`relative grid grid-cols-12 content-start ${
                componentLayout
                  ? ""
                  : getResponsiveGridColumnClassName(fallbackBounds)
              } ${fallbackStagger}`}
              layout={componentLayout}
              nodeId={prefix}
            >
              <ComponentLayoutNode
                className={childFallbackClassName}
                layout={columnLayout}
                nodeId={`${prefix}.label`}
              >
                <Typography
                  as="div"
                  preset={labelTypography?.preset ?? "sans-body"}
                  size={labelTypography?.size ?? "caption"}
                  weight="semantic"
                  wrapPolicy={labelTypography?.wrap ?? "label"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    `${prefix}.label`,
                  )}
                  className="text-textMuted"
                >
                  {phase.label}
                </Typography>
              </ComponentLayoutNode>
              <ComponentLayoutNode
                className={childFallbackClassName}
                gapFrom={`${prefix}.label`}
                layout={columnLayout}
                nodeId={`${prefix}.title`}
              >
                <Typography
                  as="h3"
                  preset={titleTypography?.preset ?? "sans-body"}
                  size={titleTypography?.size ?? resolvedDesign.titleSize}
                  weight="semantic"
                  wrapPolicy={titleTypography?.wrap ??
                    (resolvedDesign.titleAutoWrap ? "heading" : "nowrap")}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    `${prefix}.title`,
                  )}
                  className="text-textPrimary"
                >
                  {phase.title}
                </Typography>
              </ComponentLayoutNode>
              {hasEditableTextContent(phase.subtitle) ? (
                <ComponentLayoutNode
                  className={childFallbackClassName}
                  gapFrom={`${prefix}.title`}
                  layout={columnLayout}
                  nodeId={`${prefix}.subtitle`}
                >
                  <Typography
                    as="h4"
                    preset={subtitleTypography?.preset ?? "sans-body"}
                    size={subtitleTypography?.size ?? resolvedDesign.bodySize}
                    weight="light"
                    wrapPolicy={subtitleTypography?.wrap ??
                      (resolvedDesign.subtitleAutoWrap ? "prose" : "nowrap")}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      `${prefix}.subtitle`,
                    )}
                    className="text-textMuted italic"
                  >
                    {phase.subtitle}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
              {hasEditableTextContent(phase.content) ? (
                <ComponentLayoutNode
                  className={childFallbackClassName}
                  gapFrom={hasEditableTextContent(phase.subtitle)
                    ? `${prefix}.subtitle`
                    : `${prefix}.title`}
                  layout={columnLayout}
                  nodeId={`${prefix}.body`}
                >
                  <Typography
                    as="p"
                    preset={bodyTypography?.preset ?? "sans-body"}
                    size={bodyTypography?.size ?? resolvedDesign.bodySize}
                    weight="medium"
                    wrapPolicy={bodyTypography?.wrap ??
                      (resolvedDesign.bodyAutoWrap ? "prose" : "nowrap")}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      `${prefix}.body`,
                      phase.bodyAlign ?? "left",
                    )}
                    className="text-textSecondary"
                  >
                    {phase.content}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
              {items?.map((item, itemIndex) => (
                <Fragment key={`${prefix}-item-${itemIndex}`}>
                  <ComponentLayoutNode
                    className={childFallbackClassName}
                    gapFrom={itemIndex === 0
                      ? itemGapFrom
                      : `${prefix}.item.value`}
                    layout={columnLayout}
                    nodeId={`${prefix}.item.label`}
                    occurrence={itemIndex}
                  >
                    <Typography
                      as="span"
                      preset={itemLabelTypography?.preset ?? "sans-body"}
                      size={itemLabelTypography?.size ?? "caption"}
                      weight="semantic"
                      wrapPolicy={itemLabelTypography?.wrap ?? "label"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        `${prefix}.item.label`,
                      )}
                      className="text-textMuted"
                    >
                      {item.label}
                    </Typography>
                  </ComponentLayoutNode>
                  <ComponentLayoutNode
                    className={childFallbackClassName}
                    gapFrom={`${prefix}.item.label`}
                    layout={columnLayout}
                    nodeId={`${prefix}.item.value`}
                    occurrence={itemIndex}
                  >
                    <Typography
                      as="div"
                      preset={itemValueTypography?.preset ?? "sans-body"}
                      size={itemValueTypography?.size ??
                        resolvedDesign.bodySize}
                      weight="semantic"
                      wrapPolicy={itemValueTypography?.wrap ?? "prose"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        `${prefix}.item.value`,
                      )}
                      className="text-textPrimary"
                    >
                      {item.value}
                    </Typography>
                  </ComponentLayoutNode>
                </Fragment>
              ))}
              {phase.itemsContent
                ? React.Children.toArray(phase.itemsContent).map(
                  (child, itemIndex) => {
                    const key = React.isValidElement(child) &&
                        child.key !== null
                      ? child.key
                      : `${prefix}.items-${itemIndex}`;
                    if (isPuckSlotElement(child) && columnLayout) {
                      return (
                        <MetadataListItemLayoutProvider
                          key={key}
                          firstGapFrom={itemGapFrom}
                          labelNodeId={`${prefix}.item.label`}
                          layout={columnLayout}
                          valueNodeId={`${prefix}.item.value`}
                        >
                          {React.cloneElement(child, {
                            as: MetadataListItemSlotRoot,
                            className: [
                              child.props.className ?? "",
                              "col-span-12",
                            ].filter(Boolean).join(" "),
                          })}
                        </MetadataListItemLayoutProvider>
                      );
                    }
                    return (
                      <ComponentLayoutNode
                        key={key}
                        className={childFallbackClassName}
                        gapFrom={itemGapFrom}
                        layout={columnLayout}
                        nodeId={`${prefix}.item.value`}
                        occurrence={itemIndex}
                      >
                        {child}
                      </ComponentLayoutNode>
                    );
                  },
                )
                : null}
              {imageSrc ? (
                <ComponentLayoutNode
                  className={childFallbackClassName}
                  gapFrom={`${prefix}.body`}
                  layout={columnLayout}
                  nodeId={`${prefix}.media`}
                >
                  <div className="relative w-full overflow-hidden border border-white/10 bg-neutral-900">
                    <PresetImage
                      src={imageSrc}
                      alt={phase3ImageAlt}
                      preset={"imagePreset" in phase
                        ? phase.imagePreset
                        : undefined}
                      fitMode={"imageFitMode" in phase
                        ? phase.imageFitMode
                        : undefined}
                      preload={publicMediaHint?.src === imageSrc &&
                        publicMediaHint.preload}
                      mediaProfile="grid-4"
                      sizes={publicMediaHint?.src === imageSrc
                        ? publicMediaHint.sizes
                        : undefined}
                    />
                  </div>
                </ComponentLayoutNode>
              ) : null}
            </ComponentLayoutNode>
          );
        })}
      </div>
    </section>
  );
}
