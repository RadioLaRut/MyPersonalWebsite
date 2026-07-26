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
  toParagraphNodes,
  toPlainText,
} from "@/lib/editable-text";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
  getSpacingRem,
  getComponentSectionProfileClassName,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";

type ContentCardProps = {
  title: ReactNode;
  description: ReactNode;
  bodyAlign?: TypographyAlignment;
  imageSrc?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  imagePosition?: "left" | "right";
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"ContentCard"> & ComponentLayoutProps;

type StyleWithVars = CSSProperties & Record<string, string>;

export default function ContentCard({
  title,
  description,
  bodyAlign = "left",
  componentLayout,
  imageSrc,
  imagePreset = "ratio-16-9",
  imageFitMode = "x",
  imagePosition = "right",
  publicMediaHint,
  design,
}: ContentCardProps) {
  const resolvedDesign = resolveComponentDesign("ContentCard", design);
  const paragraphs = toParagraphNodes(description);
  const imageAlt = toPlainText(title) ?? "Content card image";
  const hasImage = Boolean(imageSrc);
  const mobileMediaOffsetStyle: StyleWithVars = {
    "--content-card-mobile-media-top-spacing": getSpacingRem(resolvedDesign.mobileMediaTopSpacing),
  };

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
              weight="display"
              wrapPolicy={headingTypography?.wrap ?? "heading"}
              align={getComponentLayoutAlignment(componentLayout, "heading")}
              className="text-white"
            >
              {title}
            </Typography>
          </ComponentLayoutNode>
          {paragraphs.length > 0 ? (
            <ComponentLayoutNode
              gapFrom="heading"
              layout={componentLayout}
              nodeId="body"
              className="grid"
            >
              {paragraphs.map((paragraph, index) => (
                <Typography
                  key={index}
                  as="p"
                  preset={bodyTypography?.preset ?? "sans-body"}
                  size={bodyTypography?.size ?? "body"}
                  weight="medium"
                  wrapPolicy={bodyTypography?.wrap ?? "prose"}
                  align={getComponentLayoutAlignment(componentLayout, "body", bodyAlign)}
                  className="text-textSecondary"
                  data-component-lab-node="body.item"
                >
                  {paragraph}
                </Typography>
              ))}
            </ComponentLayoutNode>
          ) : null}
          {hasImage && imageSrc ? (
            <ComponentLayoutNode layout={componentLayout} nodeId="media">
              <div className="relative w-full overflow-hidden border border-white/10 bg-[#0a0a0a]">
                <PresetImage
                  src={imageSrc}
                  alt={imageAlt}
                  preset={imagePreset}
                  fitMode={imageFitMode}
                  preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload}
                  mediaProfile="grid-6"
                  sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined}
                />
              </div>
            </ComponentLayoutNode>
          ) : null}
        </div>
      </section>
    );
  }

  const textContent = (
    <div
      className="grid w-full content-start self-start"
      style={{ rowGap: getSpacingRem(resolvedDesign.titleBodyGap) }}
    >
      <Typography
        as="h3"
        preset="sans-body"
        size={resolvedDesign.titleSize}
        weight="display"
        wrapPolicy={resolvedDesign.titleAutoWrap ? "heading" : "nowrap"}
        className="text-white"
      >
        {title}
      </Typography>

      <div
        className="grid w-full max-w-none"
        style={{ rowGap: getSpacingRem(resolvedDesign.paragraphGap) }}
      >
        {paragraphs.map((paragraph, i) => (
          <Typography
            key={i}
            as="p"
            preset="sans-body"
            size={resolvedDesign.bodySize}
            weight="medium"
            wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"}
            align={bodyAlign}
            className="text-textSecondary"
          >
            {paragraph}
          </Typography>
        ))}
      </div>
    </div>
  );

  const imageContent = hasImage && imageSrc ? (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-none border border-white/10 bg-[#0a0a0a] transition-colors duration-500 group-hover:border-white/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        <PresetImage
          src={imageSrc}
          alt={imageAlt}
          preset={imagePreset}
          fitMode={imageFitMode}
          preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload}
          mediaProfile="grid-6"
          sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined}
        />
      </div>
    </div>
  ) : null;

  if (!hasImage) {
    return (
      <div className={`grid-container w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
        <div
          className={`w-full ${getResponsiveGridColumnClassName(createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            { leftCol: 2, rightCol: 11 },
            resolvedDesign.textOnlyBounds,
          ))}`}
        >
          {textContent}
        </div>
      </div>
    );
  }

  const isImageLeft = imagePosition === "left";
  const textOrder = isImageLeft ? "order-1 md:order-2" : "";
  const imageOrder = isImageLeft ? "order-2 md:order-1" : "";
  const textBounds = isImageLeft ? resolvedDesign.imageLeftTextBounds : resolvedDesign.imageRightTextBounds;
  const imageBounds = isImageLeft ? resolvedDesign.imageLeftMediaBounds : resolvedDesign.imageRightMediaBounds;

  return (
    <div className={`grid-container w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
      <div
        className={`w-full self-start ${textOrder} ${getResponsiveGridColumnClassName(
          createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            textBounds,
            textBounds,
          ),
        )}`}
      >
        {textContent}
      </div>
      <div
        className={`w-full self-start mt-[var(--content-card-mobile-media-top-spacing)] md:mt-0 ${imageOrder} ${getResponsiveGridColumnClassName(
          createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            imageBounds,
            imageBounds,
          ),
        )}`}
        style={mobileMediaOffsetStyle}
      >
        {imageContent}
      </div>
    </div>
  );
}
