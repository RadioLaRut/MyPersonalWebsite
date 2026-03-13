"use client";

import type { CSSProperties, ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import { toParagraphNodes } from "@/lib/editable-text";
import {
  getGridColumnStyle,
  getSectionSpacingClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

interface ContentCardProps {
  title: ReactNode;
  description: ReactNode;
  imageSrc?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  imagePosition?: "left" | "right";
}

type StyleWithVars = CSSProperties & Record<string, string>;

export default function ContentCard({
  title,
  description,
  imageSrc,
  imagePreset = "ratio-16-9",
  imageFitMode = "x",
  imagePosition = "right",
}: ContentCardProps) {
  const design = useComponentDesign("ContentCard");
  const paragraphs = toParagraphNodes(description);
  const imageAlt = typeof title === "string" ? title : "Content card image";
  const hasImage = Boolean(imageSrc);
  const mobileMediaOffsetStyle: StyleWithVars = {
    "--content-card-mobile-media-top-spacing": getSpacingRem(design.mobileMediaTopSpacing),
  };

  const textContent = (
    <div
      className="grid content-start self-start"
      style={{ rowGap: getSpacingRem(design.titleBodyGap) }}
    >
      <Typography
        as="h3"
        preset="sans-body"
        size={design.titleSize}
        weight="display"
        wrapPolicy={design.titleAutoWrap ? "heading" : "nowrap"}
        className="text-white leading-none"
        style={{ lineHeight: 1 }}
      >
        {title}
      </Typography>

      <div
        className="grid max-w-none lg:max-w-[36ch]"
        style={{ rowGap: getSpacingRem(design.paragraphGap) }}
      >
        {paragraphs.map((paragraph, i) => (
          <Typography
            key={i}
            as="p"
            preset="sans-body"
            size={design.bodySize}
            weight="medium"
            wrapPolicy={design.bodyAutoWrap ? "prose" : "nowrap"}
            className="text-textMuted"
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
          sizes="100vw"
        />
      </div>
    </div>
  ) : null;

  if (!hasImage) {
    return (
      <div className={`grid-container w-full ${getSectionSpacingClassName(design.sectionSpacing)}`}>
        <div style={getGridColumnStyle(design.textOnlyBounds)}>{textContent}</div>
      </div>
    );
  }

  const isImageLeft = imagePosition === "left";
  const textOrder = isImageLeft ? "order-1 lg:order-2" : "";
  const imageOrder = isImageLeft ? "order-2 lg:order-1" : "";
  const textBounds = isImageLeft ? design.imageLeftTextBounds : design.imageRightTextBounds;
  const imageBounds = isImageLeft ? design.imageLeftMediaBounds : design.imageRightMediaBounds;

  return (
    <div className={`grid-container w-full ${getSectionSpacingClassName(design.sectionSpacing)}`}>
      <div
        className={`self-start ${textOrder}`}
        style={getGridColumnStyle(textBounds)}
      >
        {textContent}
      </div>
      <div
        className={`self-start mt-[var(--content-card-mobile-media-top-spacing)] lg:mt-0 ${imageOrder}`}
        style={{
          ...mobileMediaOffsetStyle,
          ...getGridColumnStyle(imageBounds),
        }}
      >
        {imageContent}
      </div>
    </div>
  );
}
