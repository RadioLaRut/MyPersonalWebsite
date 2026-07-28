import type { CSSProperties, ReactNode } from "react";

import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
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
  getSpacingRem,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";

type BreakdownTriptychProps = {
  col1Title: ReactNode;
  col1Text: ReactNode;
  col1BodyAlign?: TypographyAlignment;
  col1Img: string;
  col1Preset?: ImagePreset;
  col1FitMode?: ImageFitMode;
  col2Title: ReactNode;
  col2Text: ReactNode;
  col2BodyAlign?: TypographyAlignment;
  col2Img: string;
  col2Preset?: ImagePreset;
  col2FitMode?: ImageFitMode;
  col3Title: ReactNode;
  col3Text: ReactNode;
  col3BodyAlign?: TypographyAlignment;
  col3Img: string;
  col3Preset?: ImagePreset;
  col3FitMode?: ImageFitMode;
  rhythm?: "aligned" | "staggered";
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"BreakdownTriptych"> & ComponentLayoutProps;

export default function BreakdownTriptych({
  col1Title,
  col1Text,
  col1BodyAlign = "left",
  col1Img,
  col1Preset = "ratio-16-9",
  col1FitMode = "x",
  col2Title,
  col2Text,
  col2BodyAlign = "left",
  col2Img,
  col2Preset = "ratio-16-9",
  col2FitMode = "x",
  col3Title,
  col3Text,
  col3BodyAlign = "left",
  col3Img,
  col3Preset = "ratio-16-9",
  col3FitMode = "x",
  componentLayout,
  rhythm = "staggered",
  publicMediaHint,
  design,
}: BreakdownTriptychProps) {
  const resolvedDesign = resolveComponentDesign("BreakdownTriptych", design);
  const columns = [
    {
      alt: toPlainText(col1Title) ?? "Breakdown image 1",
      bodyAlign: col1BodyAlign,
      fallbackBounds: createResponsiveGridBounds(
        { leftCol: 1, rightCol: 12 },
        { leftCol: 1, rightCol: 6 },
        resolvedDesign.col1Bounds,
      ),
      fitMode: col1FitMode,
      image: col1Img,
      preset: col1Preset,
      text: col1Text,
      title: col1Title,
    },
    {
      alt: toPlainText(col2Title) ?? "Breakdown image 2",
      bodyAlign: col2BodyAlign,
      fallbackBounds: createResponsiveGridBounds(
        { leftCol: 1, rightCol: 12 },
        { leftCol: 7, rightCol: 12 },
        resolvedDesign.col2Bounds,
      ),
      fitMode: col2FitMode,
      image: col2Img,
      preset: col2Preset,
      text: col2Text,
      title: col2Title,
    },
    {
      alt: toPlainText(col3Title) ?? "Breakdown image 3",
      bodyAlign: col3BodyAlign,
      fallbackBounds: createResponsiveGridBounds(
        { leftCol: 1, rightCol: 12 },
        { leftCol: 1, rightCol: 12 },
        resolvedDesign.col3Bounds,
      ),
      fitMode: col3FitMode,
      image: col3Img,
      preset: col3Preset,
      text: col3Text,
      title: col3Title,
    },
  ];
  const sectionClassName = componentLayout
    ? getComponentSectionProfileClassName(componentLayout)
    : getSectionSpacingClassName(resolvedDesign.sectionSpacing);

  return (
    <section
      className={`relative z-20 w-full bg-black ${sectionClassName}`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="grid-container w-full border-t border-white/10 rhythm-divider-top">
        {columns.map((column, index) => {
          const prefix = `column${index + 1}`;
          const columnLayout = componentLayout
            ? createNestedComponentVariantLayout(componentLayout, prefix)
            : undefined;
          const titleTypography = getComponentLayoutTypography(
            componentLayout,
            `${prefix}.title`,
          );
          const bodyTypography = getComponentLayoutTypography(
            componentLayout,
            `${prefix}.body`,
          );
          const staggerStyle = index > 0 && rhythm === "staggered"
            ? {
              "--triptych-col-top-spacing": getSpacingRem(
                index === 1
                  ? resolvedDesign.col2TopSpacing
                  : resolvedDesign.col3TopSpacing,
              ),
            } as CSSProperties
            : undefined;
          const staggerClassName = index === 1
            ? "mt-[var(--triptych-col-top-spacing)] md:mt-0"
            : index === 2
              ? "mt-[var(--triptych-col-top-spacing)] lg:mt-0"
              : "";
          return (
            <ComponentLayoutNode
              key={prefix}
              className={`relative grid grid-cols-12 content-start ${
                componentLayout
                  ? ""
                  : getResponsiveGridColumnClassName(
                    column.fallbackBounds,
                  )
              } ${staggerClassName}`}
              layout={componentLayout}
              nodeId={prefix}
              style={staggerStyle}
            >
              {hasEditableTextContent(column.title) ? (
                <ComponentLayoutNode
                  className={!columnLayout ? "col-span-12" : undefined}
                  layout={columnLayout}
                  nodeId={`${prefix}.title`}
                >
                  <Typography
                    as="h4"
                    preset={titleTypography?.preset ?? "sans-body"}
                    size={titleTypography?.size ?? "label"}
                    weight="strong"
                    wrapPolicy={titleTypography?.wrap ?? "label"}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      `${prefix}.title`,
                    )}
                    className="border-l-2 border-white/80 pl-3 text-white"
                  >
                    {column.title}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
              {hasEditableTextContent(column.text) ? (
                <ComponentLayoutNode
                  className={!columnLayout ? "col-span-12" : undefined}
                  gapFrom={`${prefix}.title`}
                  layout={columnLayout}
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
                      column.bodyAlign,
                    )}
                    className="text-textPrimary"
                  >
                    {column.text}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
              {column.image ? (
                <ComponentLayoutNode
                  className={!columnLayout ? "col-span-12" : undefined}
                  gapFrom={`${prefix}.body`}
                  layout={columnLayout}
                  nodeId={`${prefix}.media`}
                >
                  <div className="relative mt-6 w-full overflow-hidden border border-white/10">
                    <PresetImage
                      src={column.image}
                      alt={column.alt}
                      preset={column.preset}
                      fitMode={column.fitMode}
                      preload={publicMediaHint?.src === column.image &&
                        publicMediaHint.preload}
                      mediaProfile="grid-4"
                      sizes={publicMediaHint?.src === column.image
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
