import { Fragment, type ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
  getSpacingRem,
  getComponentSectionProfileClassName,
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
  phase1: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; bodyAlign?: TypographyAlignment; items?: InfoItem[]; label?: ReactNode };
  phase2: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; bodyAlign?: TypographyAlignment; items?: InfoItem[]; label?: ReactNode };
  phase3: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; bodyAlign?: TypographyAlignment; imageSrc?: string; imagePreset?: ImagePreset; imageFitMode?: ImageFitMode; label?: ReactNode };
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
  const phase1Label = hasEditableTextContent(phase1.label) ? phase1.label : DEFAULT_PHASE_LABELS.phase1;
  const phase2Label = hasEditableTextContent(phase2.label) ? phase2.label : DEFAULT_PHASE_LABELS.phase2;
  const phase3Label = hasEditableTextContent(phase3.label) ? phase3.label : DEFAULT_PHASE_LABELS.phase3;

  if (componentLayout) {
    const phases = [
      {
        ...phase1,
        itemsContent: phase1ItemsContent,
        label: phase1Label,
      },
      {
        ...phase2,
        itemsContent: phase2ItemsContent,
        label: phase2Label,
      },
      {
        ...phase3,
        itemsContent: undefined,
        label: phase3Label,
      },
    ];

    return (
      <section className={`w-full ${getComponentSectionProfileClassName(componentLayout)}`}>
        <div className="grid-container border-t border-white/20 rhythm-divider-top">
          {phases.map((phase, phaseIndex) => {
            const column = phaseIndex + 1;
            const prefix = `column${column}`;
            const labelTypography = getComponentLayoutTypography(componentLayout, `${prefix}.label`);
            const titleTypography = getComponentLayoutTypography(componentLayout, `${prefix}.title`);
            const subtitleTypography = getComponentLayoutTypography(componentLayout, `${prefix}.subtitle`);
            const bodyTypography = getComponentLayoutTypography(componentLayout, `${prefix}.body`);
            const itemLabelTypography = getComponentLayoutTypography(componentLayout, `${prefix}.item.label`);
            const itemValueTypography = getComponentLayoutTypography(componentLayout, `${prefix}.item.value`);
            const items = "items" in phase ? phase.items : undefined;
            const imageSrc = "imageSrc" in phase ? phase.imageSrc : undefined;
            return (
              <Fragment key={prefix}>
                {hasEditableTextContent(phase.label) ? (
                  <ComponentLayoutNode layout={componentLayout} nodeId={`${prefix}.label`}>
                    <Typography
                      as="div"
                      preset={labelTypography?.preset ?? "sans-body"}
                      size={labelTypography?.size ?? "label"}
                      weight="semantic"
                      wrapPolicy={labelTypography?.wrap ?? "label"}
                      align={getComponentLayoutAlignment(componentLayout, `${prefix}.label`)}
                      className="text-textMuted"
                    >
                      {phase.label}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
                <ComponentLayoutNode
                  gapFrom={`${prefix}.label`}
                  layout={componentLayout}
                  nodeId={`${prefix}.title`}
                >
                  <Typography
                    as="h3"
                    preset={titleTypography?.preset ?? "sans-body"}
                    size={titleTypography?.size ?? "title-sm"}
                    weight="semantic"
                    wrapPolicy={titleTypography?.wrap ?? "heading"}
                    align={getComponentLayoutAlignment(componentLayout, `${prefix}.title`)}
                    className="text-textPrimary"
                  >
                    {phase.title}
                  </Typography>
                </ComponentLayoutNode>
                {hasEditableTextContent(phase.subtitle) ? (
                  <ComponentLayoutNode
                    gapFrom={`${prefix}.title`}
                    layout={componentLayout}
                    nodeId={`${prefix}.subtitle`}
                  >
                    <Typography
                      as="h4"
                      preset={subtitleTypography?.preset ?? "sans-body"}
                      size={subtitleTypography?.size ?? "body"}
                      weight="light"
                      wrapPolicy={subtitleTypography?.wrap ?? "prose"}
                      align={getComponentLayoutAlignment(componentLayout, `${prefix}.subtitle`)}
                      className="text-textMuted italic"
                    >
                      {phase.subtitle}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(phase.content) ? (
                  <ComponentLayoutNode
                    gapFrom={hasEditableTextContent(phase.subtitle)
                      ? `${prefix}.subtitle`
                      : `${prefix}.title`}
                    layout={componentLayout}
                    nodeId={`${prefix}.body`}
                  >
                    <Typography
                      as="p"
                      preset={bodyTypography?.preset ?? "sans-body"}
                      size={bodyTypography?.size ?? "body"}
                      weight="medium"
                      wrapPolicy={bodyTypography?.wrap ?? "prose"}
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
                      gapFrom={`${prefix}.body`}
                      layout={componentLayout}
                      nodeId={`${prefix}.item.label`}
                    >
                      <Typography
                        as="span"
                        preset={itemLabelTypography?.preset ?? "sans-body"}
                        size={itemLabelTypography?.size ?? "label"}
                        weight="semantic"
                        wrapPolicy={itemLabelTypography?.wrap ?? "label"}
                        align={getComponentLayoutAlignment(componentLayout, `${prefix}.item.label`)}
                        className="text-textMuted"
                      >
                        {item.label}
                      </Typography>
                    </ComponentLayoutNode>
                    <ComponentLayoutNode
                      gapFrom={`${prefix}.item.label`}
                      layout={componentLayout}
                      nodeId={`${prefix}.item.value`}
                    >
                      <Typography
                        as="div"
                        preset={itemValueTypography?.preset ?? "sans-body"}
                        size={itemValueTypography?.size ?? "body"}
                        weight="semantic"
                        wrapPolicy={itemValueTypography?.wrap ?? "prose"}
                        align={getComponentLayoutAlignment(componentLayout, `${prefix}.item.value`)}
                        className="text-textPrimary"
                      >
                        {item.value}
                      </Typography>
                    </ComponentLayoutNode>
                  </Fragment>
                ))}
                {phase.itemsContent ? (
                  <ComponentLayoutNode
                    gapFrom={`${prefix}.body`}
                    layout={componentLayout}
                    nodeId={`${prefix}.item.value`}
                  >
                    {phase.itemsContent}
                  </ComponentLayoutNode>
                ) : null}
                {imageSrc ? (
                  <ComponentLayoutNode
                    gapFrom={`${prefix}.body`}
                    layout={componentLayout}
                    nodeId={`${prefix}.media`}
                  >
                    <div className="relative w-full overflow-hidden border border-white/10 bg-neutral-900">
                      <PresetImage
                        src={imageSrc}
                        alt={phase3ImageAlt}
                        preset={"imagePreset" in phase ? phase.imagePreset : undefined}
                        fitMode={"imageFitMode" in phase ? phase.imageFitMode : undefined}
                        preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload}
                        mediaProfile="grid-4"
                        sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined}
                      />
                    </div>
                  </ComponentLayoutNode>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </section>
    );
  }

    return (
        <div className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
            <div className="grid-container border-t border-white/20 rhythm-divider-top">

                <div className={`pr-0 lg:pr-5 mb-12 lg:mb-0 border-r border-white/5 ${getResponsiveGridColumnClassName(createResponsiveGridBounds(
                  { leftCol: 1, rightCol: 12 },
                  { leftCol: 1, rightCol: 6 },
                  resolvedDesign.leftBounds,
                ))}`}>
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase1Label}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size={resolvedDesign.titleSize} weight="semantic" wrapPolicy={resolvedDesign.titleAutoWrap ? "heading" : "nowrap"} className="text-textPrimary" style={{ marginBottom: getSpacingRem(resolvedDesign.phaseTitleGap) }}>{phase1.title}</Typography>
                    {hasEditableTextContent(phase1.subtitle) && <Typography as="h4" preset="sans-body" size={resolvedDesign.bodySize} weight="light" wrapPolicy={resolvedDesign.subtitleAutoWrap ? "prose" : "nowrap"} className="text-textMuted italic" style={{ marginBottom: getSpacingRem(resolvedDesign.subtitleGap) }}>{phase1.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size={resolvedDesign.bodySize} weight="medium" wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"} align={phase1.bodyAlign ?? "left"} className="pr-0 text-textSecondary lg:pr-4" style={{ marginBottom: getSpacingRem(resolvedDesign.titleBodyGap) }}>
                        {phase1.content}
                    </Typography>

                    {phase1.items && (
                        <div className="grid border-t border-white/10 pt-6" style={{ marginTop: getSpacingRem(resolvedDesign.itemsTopSpacing), rowGap: getSpacingRem("12") }}>
                            {phase1.items.map((item, i) => (
                                <div key={i} className="grid gap-1">
                                    <Typography as="span" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="text-textMuted">
                                        {item.label}
                                    </Typography>
                                    <Typography as="div" preset="sans-body" size={resolvedDesign.bodySize} weight="semantic" wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"} align="right" className="text-textPrimary text-left lg:text-right max-w-full lg:max-w-[75%] self-start lg:self-end">{item.value}</Typography>
                                </div>
                            ))}
                        </div>
                    )}

                    {phase1ItemsContent ? (
                        <div className="border-t border-white/10 pt-6" style={{ marginTop: getSpacingRem(resolvedDesign.itemsTopSpacing) }}>
                            {phase1ItemsContent}
                        </div>
                    ) : null}
                </div>

                <div className={`px-0 lg:px-8 mb-12 lg:mb-0 border-r border-transparent lg:border-white/5 ${rhythm === "staggered" ? "lg:pt-8" : ""} ${getResponsiveGridColumnClassName(createResponsiveGridBounds(
                  { leftCol: 1, rightCol: 12 },
                  { leftCol: 7, rightCol: 12 },
                  resolvedDesign.middleBounds,
                ))}`}>
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase2Label}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size={resolvedDesign.titleSize} weight="semantic" wrapPolicy={resolvedDesign.titleAutoWrap ? "heading" : "nowrap"} className="text-textPrimary" style={{ marginBottom: getSpacingRem(resolvedDesign.phaseTitleGap) }}>{phase2.title}</Typography>
                    {hasEditableTextContent(phase2.subtitle) && <Typography as="h4" preset="sans-body" size={resolvedDesign.bodySize} weight="light" wrapPolicy={resolvedDesign.subtitleAutoWrap ? "prose" : "nowrap"} className="text-textMuted italic" style={{ marginBottom: getSpacingRem(resolvedDesign.subtitleGap) }}>{phase2.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size={resolvedDesign.bodySize} weight="medium" wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"} align={phase2.bodyAlign ?? "left"} className="text-textSecondary" style={{ marginBottom: getSpacingRem(resolvedDesign.titleBodyGap) }}>
                        {phase2.content}
                    </Typography>

                    {phase2.items && (
                        <div className="grid border-t border-white/10 pt-6" style={{ marginTop: getSpacingRem(resolvedDesign.itemsTopSpacing), rowGap: getSpacingRem("12") }}>
                            {phase2.items.map((item, i) => (
                                <div key={i} className="grid gap-1">
                                    <Typography as="span" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="text-textMuted">
                                        {item.label}
                                    </Typography>
                                    <Typography as="span" preset="sans-body" size={resolvedDesign.bodySize} weight="semantic" wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"} className="text-textPrimary">{item.value}</Typography>
                                </div>
                            ))}
                        </div>
                    )}

                    {phase2ItemsContent ? (
                        <div className="border-t border-white/10 pt-6" style={{ marginTop: getSpacingRem(resolvedDesign.itemsTopSpacing) }}>
                            {phase2ItemsContent}
                        </div>
                    ) : null}
                </div>

                <div className={`pl-0 lg:pl-8 ${rhythm === "staggered" ? "lg:pt-16" : ""} ${getResponsiveGridColumnClassName(createResponsiveGridBounds(
                  { leftCol: 1, rightCol: 12 },
                  { leftCol: 1, rightCol: 12 },
                  resolvedDesign.rightBounds,
                ))}`}>
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase3Label}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size={resolvedDesign.titleSize} weight="semantic" wrapPolicy={resolvedDesign.titleAutoWrap ? "heading" : "nowrap"} className="text-textPrimary" style={{ marginBottom: getSpacingRem(resolvedDesign.phaseTitleGap) }}>{phase3.title}</Typography>
                    {hasEditableTextContent(phase3.subtitle) && <Typography as="h4" preset="sans-body" size={resolvedDesign.bodySize} weight="light" wrapPolicy={resolvedDesign.subtitleAutoWrap ? "prose" : "nowrap"} className="text-textMuted italic" style={{ marginBottom: getSpacingRem(resolvedDesign.subtitleGap) }}>{phase3.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size={resolvedDesign.bodySize} weight="medium" wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"} align={phase3.bodyAlign ?? "left"} className="text-textSecondary" style={{ marginBottom: getSpacingRem(resolvedDesign.titleBodyGap) }}>
                        {phase3.content}
                    </Typography>

                    {phase3.imageSrc && (
                        <div className="relative w-full overflow-hidden border border-white/10 bg-neutral-900" style={{ marginTop: getSpacingRem(resolvedDesign.imageTopSpacing) }}>
                            <PresetImage
                                src={phase3.imageSrc}
                                alt={phase3ImageAlt}
                                preset={phase3.imagePreset}
                                fitMode={phase3.imageFitMode}
                                preload={publicMediaHint?.src === phase3.imageSrc && publicMediaHint.preload}
                                mediaProfile="grid-4"
                                sizes={publicMediaHint?.src === phase3.imageSrc ? publicMediaHint.sizes : undefined}
                                imageClassName="opacity-90 transition-all duration-700 hover:scale-105 hover:opacity-100"
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
