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
import { toPlainText } from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";

type TextSplitLayoutProps = {
  heading: ReactNode;
  paragraphs: ReactNode[];
  bodyAlign?: TypographyAlignment;
  imageSrc?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  layoutVariant?: "split-left" | "split-right" | "stack";
  paragraphsContent?: ReactNode;
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"TextSplitLayout"> & ComponentLayoutProps;

type StyleWithVars = CSSProperties & Record<string, string>;

export default function TextSplitLayout({
  heading,
  paragraphs,
  bodyAlign = "left",
  componentLayout,
  imageSrc,
  imagePreset = "ratio-16-9",
  imageFitMode = "x",
  layoutVariant = "split-left",
  paragraphsContent,
  publicMediaHint,
  design,
}: TextSplitLayoutProps) {
  const resolvedDesign = resolveComponentDesign("TextSplitLayout", design);
  const imageAlt = toPlainText(heading) ?? "TextSplitLayout image";
  const splitHeadingGapStyle: StyleWithVars = {
    "--text-split-heading-image-gap": getSpacingRem(resolvedDesign.headingImageGap),
  };
  const paragraphContent = paragraphsContent ?? (
    <div
      className="grid"
      style={{ rowGap: getSpacingRem(resolvedDesign.paragraphGap) }}
    >
      {paragraphs.map((p, i) => (
        <Typography
          key={i}
          as="p"
          preset="sans-body"
          size={resolvedDesign.bodySize}
          weight="semantic"
          wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"}
          align={bodyAlign}
          className="text-textSecondary"
        >
          {p}
        </Typography>
      ))}
    </div>
  );

  if (componentLayout) {
    const headingTypography = getComponentLayoutTypography(componentLayout, "heading");
    const bodyTypography = getComponentLayoutTypography(componentLayout, "body");
    return (
      <section className={`w-full ${getComponentSectionProfileClassName(componentLayout)}`}>
        <div className="grid-container items-start">
          <ComponentLayoutNode layout={componentLayout} nodeId="heading">
            <Typography
              as="h3"
              preset={headingTypography?.preset ?? "sans-body"}
              size={headingTypography?.size ?? "title-sm"}
              weight="semantic"
              wrapPolicy={headingTypography?.wrap ?? "heading"}
              align={getComponentLayoutAlignment(componentLayout, "heading")}
              className="text-white uppercase"
            >
              {heading}
            </Typography>
          </ComponentLayoutNode>
          <ComponentLayoutNode
            gapFrom="heading"
            layout={componentLayout}
            nodeId="body"
            className="grid"
          >
            {paragraphsContent ? (
              <div data-component-lab-node="body.item">{paragraphsContent}</div>
            ) : (
              paragraphs.map((paragraph, index) => (
                <Typography
                  key={index}
                  as="p"
                  preset={bodyTypography?.preset ?? "sans-body"}
                  size={bodyTypography?.size ?? "body"}
                  weight="semantic"
                  wrapPolicy={bodyTypography?.wrap ?? "prose"}
                  align={getComponentLayoutAlignment(componentLayout, "body", bodyAlign)}
                  className="text-textSecondary"
                  data-component-lab-node="body.item"
                >
                  {paragraph}
                </Typography>
              ))
            )}
          </ComponentLayoutNode>
          {imageSrc ? (
            <ComponentLayoutNode
              gapFrom="body"
              layout={componentLayout}
              nodeId="media"
            >
              <div className="relative w-full opacity-90">
                <PresetImage
                  src={imageSrc}
                  alt={imageAlt}
                  preset={imagePreset}
                  fitMode={imageFitMode}
                  mediaProfile={layoutVariant === "stack" ? "grid-10" : "grid-6"}
                  preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload}
                  sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined}
                />
              </div>
            </ComponentLayoutNode>
          ) : null}
        </div>
      </section>
    );
  }

    return (
        <div className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
            <div className="grid-container items-start">

                {layoutVariant === 'split-left' && (
                    <>
                        <div
                            className={`mb-[var(--text-split-heading-image-gap)] md:mb-0 ${getResponsiveGridColumnClassName(
                              createResponsiveGridBounds(
                                { leftCol: 1, rightCol: 12 },
                                resolvedDesign.splitLeftHeadingBounds,
                                resolvedDesign.splitLeftHeadingBounds,
                              ),
                            )}`}
                            style={splitHeadingGapStyle}
                        >
                            <Typography as="h3" preset="sans-body" size={resolvedDesign.splitHeadingSize} weight="light" wrapPolicy={resolvedDesign.headingAutoWrap ? "heading" : "nowrap"} className="mb-8 text-white uppercase">
                                {heading}
                            </Typography>
                            {imageSrc && (
                                <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
                                    <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} mediaProfile="grid-6" preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload} sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                        <div
                            className={`grid content-center ${getResponsiveGridColumnClassName(
                              createResponsiveGridBounds(
                                { leftCol: 1, rightCol: 12 },
                                resolvedDesign.splitLeftTextBounds,
                                resolvedDesign.splitLeftTextBounds,
                              ),
                            )}`}
                        >
                            <div className="border-l border-white/5 pl-0 lg:pl-8">
                                {paragraphContent}
                            </div>
                        </div>
                    </>
                )}

                {layoutVariant === 'split-right' && (
                    <>
                        <div
                            className={`order-2 mt-[var(--text-split-heading-image-gap)] grid content-center md:order-1 md:mb-0 md:mt-0 ${getResponsiveGridColumnClassName(
                              createResponsiveGridBounds(
                                { leftCol: 1, rightCol: 12 },
                                resolvedDesign.splitRightTextBounds,
                                resolvedDesign.splitRightTextBounds,
                              ),
                            )}`}
                            style={splitHeadingGapStyle}
                        >
                            <div className="border-r border-white/5 pr-0 text-right lg:pr-8 lg:text-left">
                                {paragraphContent}
                            </div>
                        </div>
                        <div
                            className={`order-1 md:order-2 ${getResponsiveGridColumnClassName(
                              createResponsiveGridBounds(
                                { leftCol: 1, rightCol: 12 },
                                resolvedDesign.splitRightHeadingBounds,
                                resolvedDesign.splitRightHeadingBounds,
                              ),
                            )}`}
                        >
                            <Typography as="h3" preset="sans-body" size={resolvedDesign.splitHeadingSize} weight="light" wrapPolicy={resolvedDesign.headingAutoWrap ? "heading" : "nowrap"} align="right" className="mb-8 text-white uppercase">
                                {heading}
                            </Typography>
                            {imageSrc && (
                                <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
                                    <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} mediaProfile="grid-6" preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload} sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {layoutVariant === 'stack' && (
                    <div
                        className={`grid justify-items-center text-center ${getResponsiveGridColumnClassName(
                          createResponsiveGridBounds(
                            { leftCol: 1, rightCol: 12 },
                            { leftCol: 2, rightCol: 11 },
                            resolvedDesign.stackBounds,
                          ),
                        )}`}
                    >
                        <Typography
                            as="h3"
                            preset="sans-body"
                            size={resolvedDesign.stackHeadingSize}
                            weight="strong"
                            wrapPolicy={resolvedDesign.headingAutoWrap ? "heading" : "nowrap"}
                            align="center"
                            className="px-4 text-white uppercase"
                            style={{ marginBottom: getSpacingRem(resolvedDesign.stackTextTopSpacing) }}
                        >
                            {heading}
                        </Typography>
                        <div
                            className="grid max-w-3xl border-t border-white/5"
                            style={{
                                paddingTop: getSpacingRem(resolvedDesign.stackTextTopSpacing),
                                rowGap: getSpacingRem(resolvedDesign.paragraphGap),
                            }}
                        >
                            {paragraphContent}
                        </div>
                        {imageSrc && (
                            <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100" style={{ marginTop: getSpacingRem(resolvedDesign.stackImageTopSpacing) }}>
                                <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} mediaProfile="grid-10" preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload} sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined} />
                                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
