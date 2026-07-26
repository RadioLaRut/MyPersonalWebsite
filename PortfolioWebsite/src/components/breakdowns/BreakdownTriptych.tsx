import type { CSSProperties, ReactNode } from "react";
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
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";

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

function TriptychColumn({
  title,
  text,
  bodyAlign,
  img,
  alt,
  boundsClassName,
  preset = "ratio-16-9",
  fitMode = "x",
  className = "",
  style,
  publicMediaHint,
}: {
  title: ReactNode;
  text: ReactNode;
  bodyAlign: TypographyAlignment;
  img: string;
  alt: string;
  boundsClassName: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
  className?: string;
  style?: CSSProperties;
  publicMediaHint?: PublicMediaHint;
}) {
  const hasTitle = hasEditableTextContent(title);
  const hasText = hasEditableTextContent(text);
  if (!hasTitle && !hasText && !img) return null;

  return (
    <div className={`${boundsClassName} space-y-4 ${className}`} style={style}>
      {hasTitle && (
        <Typography as="h4" preset="sans-body" size="label" weight="strong" wrapPolicy="label" className="border-l-2 pl-3 border-white/80 text-white">
          {title}
        </Typography>
      )}
      {hasText && (
        <Typography as="p" preset="sans-body" size="body" weight="medium" wrapPolicy="prose" align={bodyAlign} className="text-textPrimary">
          {text}
        </Typography>
      )}
      {img && (
        <div className="w-full relative overflow-hidden mt-6 border border-white/10">
          <PresetImage
            src={img}
            alt={alt}
            preset={preset}
            fitMode={fitMode}
            preload={publicMediaHint?.src === img && publicMediaHint.preload}
            mediaProfile="grid-4"
            sizes={publicMediaHint?.src === img ? publicMediaHint.sizes : undefined}
          />
        </div>
      )}
    </div>
  );
}

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
  const col1Alt = toPlainText(col1Title) ?? "Breakdown image 1";
  const col2Alt = toPlainText(col2Title) ?? "Breakdown image 2";
  const col3Alt = toPlainText(col3Title) ?? "Breakdown image 3";
  const col2Style = {
    "--triptych-col-top-spacing": rhythm === "staggered"
      ? getSpacingRem(resolvedDesign.col2TopSpacing)
      : "0rem",
  } as CSSProperties;
  const col3Style = {
    "--triptych-col-top-spacing": rhythm === "staggered"
      ? getSpacingRem(resolvedDesign.col3TopSpacing)
      : "0rem",
  } as CSSProperties;

  if (componentLayout) {
    const columns = [
      {
        alt: col1Alt,
        bodyAlign: col1BodyAlign,
        fitMode: col1FitMode,
        image: col1Img,
        preset: col1Preset,
        text: col1Text,
        title: col1Title,
      },
      {
        alt: col2Alt,
        bodyAlign: col2BodyAlign,
        fitMode: col2FitMode,
        image: col2Img,
        preset: col2Preset,
        text: col2Text,
        title: col2Title,
      },
      {
        alt: col3Alt,
        bodyAlign: col3BodyAlign,
        fitMode: col3FitMode,
        image: col3Img,
        preset: col3Preset,
        text: col3Text,
        title: col3Title,
      },
    ];
    return (
      <section className={`relative z-20 w-full bg-black ${getComponentSectionProfileClassName(componentLayout)}`}>
        <div className="grid-container w-full border-t border-white/10 rhythm-divider-top">
          {columns.flatMap((column, index) => {
            const prefix = `column${index + 1}`;
            const titleTypography = getComponentLayoutTypography(componentLayout, `${prefix}.title`);
            const bodyTypography = getComponentLayoutTypography(componentLayout, `${prefix}.body`);
            return [
              hasEditableTextContent(column.title) ? (
                <ComponentLayoutNode
                  key={`${prefix}.title`}
                  layout={componentLayout}
                  nodeId={`${prefix}.title`}
                >
                  <Typography
                    as="h4"
                    preset={titleTypography?.preset ?? "sans-body"}
                    size={titleTypography?.size ?? "title-sm"}
                    weight="semantic"
                    wrapPolicy={titleTypography?.wrap ?? "heading"}
                    align={getComponentLayoutAlignment(componentLayout, `${prefix}.title`)}
                    className="border-l-2 border-white/80 pl-3 text-white"
                  >
                    {column.title}
                  </Typography>
                </ComponentLayoutNode>
              ) : null,
              hasEditableTextContent(column.text) ? (
                <ComponentLayoutNode
                  key={`${prefix}.body`}
                  gapFrom={`${prefix}.title`}
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
                      column.bodyAlign,
                    )}
                    className="text-textPrimary"
                  >
                    {column.text}
                  </Typography>
                </ComponentLayoutNode>
              ) : null,
              column.image ? (
                <ComponentLayoutNode
                  key={`${prefix}.media`}
                  gapFrom={`${prefix}.body`}
                  layout={componentLayout}
                  nodeId={`${prefix}.media`}
                >
                  <div className="relative w-full overflow-hidden border border-white/10">
                    <PresetImage
                      src={column.image}
                      alt={column.alt}
                      preset={column.preset}
                      fitMode={column.fitMode}
                      preload={publicMediaHint?.src === column.image && publicMediaHint.preload}
                      mediaProfile="grid-4"
                      sizes={publicMediaHint?.src === column.image ? publicMediaHint.sizes : undefined}
                    />
                  </div>
                </ComponentLayoutNode>
              ) : null,
            ];
          })}
        </div>
      </section>
    );
  }

  return (
    <section className={`relative z-20 w-full bg-black ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
      <div className="grid-container w-full border-t border-white/10 rhythm-divider-top">
        <TriptychColumn
          title={col1Title}
          text={col1Text}
          bodyAlign={col1BodyAlign}
          img={col1Img}
          alt={col1Alt}
          boundsClassName={getResponsiveGridColumnClassName(createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            { leftCol: 1, rightCol: 6 },
            resolvedDesign.col1Bounds,
          ))}
          preset={col1Preset}
          fitMode={col1FitMode}
          publicMediaHint={publicMediaHint}
        />
        <TriptychColumn
          title={col2Title}
          text={col2Text}
          bodyAlign={col2BodyAlign}
          img={col2Img}
          alt={col2Alt}
          boundsClassName={getResponsiveGridColumnClassName(createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            { leftCol: 7, rightCol: 12 },
            resolvedDesign.col2Bounds,
          ))}
          preset={col2Preset}
          fitMode={col2FitMode}
          className="mt-[var(--triptych-col-top-spacing)] md:mt-0"
          style={col2Style}
          publicMediaHint={publicMediaHint}
        />
        <TriptychColumn
          title={col3Title}
          text={col3Text}
          bodyAlign={col3BodyAlign}
          img={col3Img}
          alt={col3Alt}
          boundsClassName={getResponsiveGridColumnClassName(createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            { leftCol: 1, rightCol: 12 },
            resolvedDesign.col3Bounds,
          ))}
          preset={col3Preset}
          fitMode={col3FitMode}
          className="mt-[var(--triptych-col-top-spacing)] lg:mt-0"
          style={col3Style}
          publicMediaHint={publicMediaHint}
        />
      </div>
    </section>
  );
}
