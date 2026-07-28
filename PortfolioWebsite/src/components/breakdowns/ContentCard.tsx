import type { ReactNode } from "react";

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
} from "@/lib/component-design-style";
import {
  toParagraphNodes,
  toPlainText,
} from "@/lib/editable-text";
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
  const isImageLeft = imagePosition === "left";
  const textBounds = !hasImage
    ? resolvedDesign.textOnlyBounds
    : isImageLeft
      ? resolvedDesign.imageLeftTextBounds
      : resolvedDesign.imageRightTextBounds;
  const imageBounds = isImageLeft
    ? resolvedDesign.imageLeftMediaBounds
    : resolvedDesign.imageRightMediaBounds;
  const textFallbackClassName = getResponsiveGridColumnClassName(
    createResponsiveGridBounds(
      { leftCol: 1, rightCol: 12 },
      hasImage ? textBounds : { leftCol: 2, rightCol: 11 },
      textBounds,
    ),
  );
  const mediaFallbackClassName = getResponsiveGridColumnClassName(
    createResponsiveGridBounds(
      { leftCol: 1, rightCol: 12 },
      imageBounds,
      imageBounds,
    ),
  );
  const headingTypography = getComponentLayoutTypography(
    componentLayout,
    "heading",
  );
  const bodyItemTypography = getComponentLayoutTypography(
    componentLayout,
    "body.item",
  );
  const bodyItemLayout = componentLayout
    ? createNestedComponentVariantLayout(componentLayout, "body")
    : undefined;
  const sectionClassName = componentLayout
    ? getComponentSectionProfileClassName(componentLayout)
    : getSectionSpacingClassName(resolvedDesign.sectionSpacing);

  return (
    <section
      className={`w-full ${sectionClassName}`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="grid-container items-start">
        <ComponentLayoutNode
          className={!componentLayout ? textFallbackClassName : undefined}
          layout={componentLayout}
          nodeId="heading"
        >
          <Typography
            as="h3"
            preset={headingTypography?.preset ?? "sans-body"}
            size={headingTypography?.size ?? resolvedDesign.titleSize}
            weight="display"
            wrapPolicy={headingTypography?.wrap ??
              (resolvedDesign.titleAutoWrap ? "heading" : "nowrap")}
            align={getComponentLayoutAlignment(
              componentLayout,
              "heading",
            )}
            className="text-white"
          >
            {title}
          </Typography>
        </ComponentLayoutNode>
        {paragraphs.length > 0 ? (
          <ComponentLayoutNode
            className={`relative grid grid-cols-12 content-start ${
              !componentLayout ? textFallbackClassName : ""
            }`}
            gapFrom="heading"
            layout={componentLayout}
            nodeId="body"
          >
            {paragraphs.map((paragraph, index) => (
              <ComponentLayoutNode
                key={index}
                gapFrom={index === 0 ? "body" : "body.item"}
                layout={bodyItemLayout}
                nodeId="body.item"
                occurrence={index}
              >
                <Typography
                  as="p"
                  preset={bodyItemTypography?.preset ?? "sans-body"}
                  size={bodyItemTypography?.size ?? resolvedDesign.bodySize}
                  weight="medium"
                  wrapPolicy={bodyItemTypography?.wrap ??
                    (resolvedDesign.bodyAutoWrap ? "prose" : "nowrap")}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "body.item",
                    bodyAlign,
                  )}
                  className="text-textSecondary"
                >
                  {paragraph}
                </Typography>
              </ComponentLayoutNode>
            ))}
          </ComponentLayoutNode>
        ) : null}
        {hasImage && imageSrc ? (
          <ComponentLayoutNode
            className={!componentLayout
              ? `${mediaFallbackClassName} ${
                isImageLeft ? "order-2 md:order-1" : ""
              }`
              : undefined}
            layout={componentLayout}
            nodeId="media"
          >
            <div className="group relative w-full overflow-hidden border border-white/10 bg-[#0a0a0a] transition-colors duration-500 hover:border-white/20">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <PresetImage
                src={imageSrc}
                alt={imageAlt}
                preset={imagePreset}
                fitMode={imageFitMode}
                preload={publicMediaHint?.src === imageSrc &&
                  publicMediaHint.preload}
                mediaProfile="grid-6"
                sizes={publicMediaHint?.src === imageSrc
                  ? publicMediaHint.sizes
                  : undefined}
              />
            </div>
          </ComponentLayoutNode>
        ) : null}
      </div>
    </section>
  );
}
