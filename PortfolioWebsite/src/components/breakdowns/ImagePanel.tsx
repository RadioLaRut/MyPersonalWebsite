import type { ReactNode } from "react";

import ComponentLayoutNode, {
  getComponentLabNodeAttributes,
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import { PresetImage } from "@/components/common/PresetImage";
import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
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

export type ImagePanelProps = {
  src: string;
  alt?: string;
  caption?: ReactNode;
  captionAlign?: TypographyAlignment;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
  variant?: "content" | "large" | "fullscreen";
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"ImagePanel"> & ComponentLayoutProps;

export default function ImagePanel({
  src,
  alt,
  caption,
  captionAlign = "left",
  componentLayout,
  preset,
  fitMode,
  variant = "content",
  publicMediaHint,
  design,
}: ImagePanelProps) {
  const resolvedDesign = resolveComponentDesign("ImagePanel", design);
  if (!src) return null;

  const imageAlt = alt || toPlainText(caption) || "Image";
  const hasCaption = hasEditableTextContent(caption);
  const captionTypography = getComponentLayoutTypography(
    componentLayout,
    "caption",
  );
  const sectionClassName = componentLayout
    ? getComponentSectionProfileClassName(componentLayout)
    : getSectionSpacingClassName(resolvedDesign.sectionSpacing);
  const media = (
    <PresetImage
      alt={imageAlt}
      src={src}
      preset={preset}
      fitMode={fitMode}
      fitModeByBreakpoint={variant === "fullscreen"
        ? {
          base: preset === "native" ? "x" : "cover",
          lg: fitMode ?? "x",
        }
        : undefined}
      preload={publicMediaHint?.src === src && publicMediaHint.preload}
      mediaProfile={variant === "fullscreen" ? "full-bleed" : "grid-10"}
      sizes={publicMediaHint?.src === src ? publicMediaHint.sizes : undefined}
      lockFrame={variant === "fullscreen" ? false : undefined}
      frameClassName={variant === "fullscreen"
        ? "h-full w-full pointer-events-none"
        : "w-full"}
      imageClassName="select-none"
    />
  );

  if (variant === "fullscreen") {
    return (
      <section
        className={`relative min-h-[calc(var(--site-viewport-unit)*100)] w-full bg-black ${sectionClassName}`}
        style={getComponentSectionStyle(componentLayout)}
      >
        <div
          className="absolute inset-0"
          {...getComponentLabNodeAttributes(componentLayout, "media")}
        >
          {media}
        </div>
        {hasCaption ? (
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="grid-container h-full">
              <ComponentLayoutNode
                className="pointer-events-auto self-end pb-5 md:pb-8"
                layout={componentLayout}
                nodeId="caption"
              >
                <Typography
                  as="p"
                  preset={captionTypography?.preset ?? "sans-body"}
                  size={captionTypography?.size ?? "label"}
                  weight="semantic"
                  wrapPolicy={captionTypography?.wrap ?? "prose"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "caption",
                    captionAlign,
                  )}
                  className="w-fit justify-self-end border border-white/15 bg-black/65 px-4 py-2 text-textPrimary"
                >
                  {caption}
                </Typography>
              </ComponentLayoutNode>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  const fallbackBounds = variant === "large"
    ? createResponsiveGridBounds(
      { leftCol: 1, rightCol: 12 },
      { leftCol: 2, rightCol: 11 },
      resolvedDesign.largeBounds,
    )
    : createResponsiveGridBounds(
      { leftCol: 1, rightCol: 12 },
      { leftCol: 2, rightCol: 11 },
      resolvedDesign.contentBounds,
    );

  return (
    <section
      className={`w-full ${sectionClassName}`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="grid-container items-start">
        <figure className="contents">
          <ComponentLayoutNode
            layout={componentLayout}
            nodeId="media"
            className={`${
              componentLayout
                ? ""
                : getResponsiveGridColumnClassName(fallbackBounds)
            } ${
              variant === "large"
                ? "overflow-hidden border border-white/10 bg-white/[0.02]"
                : "mx-auto w-full max-w-5xl overflow-hidden border border-white/15 bg-white/[0.03]"
            }`}
          >
            {media}
          </ComponentLayoutNode>
          {hasCaption ? (
            <ComponentLayoutNode
              as="figcaption"
              gapFrom="media"
              layout={componentLayout}
              nodeId="caption"
              className={variant === "large"
                ? "border-t border-white/10 px-5 py-4 md:px-6"
                : "border-t border-white/15 px-4 py-3"}
            >
              <Typography
                preset={captionTypography?.preset ?? "sans-body"}
                size={captionTypography?.size ??
                  (variant === "large" ? "caption" : "label")}
                weight="semantic"
                wrapPolicy={captionTypography?.wrap ?? "prose"}
                align={getComponentLayoutAlignment(
                  componentLayout,
                  "caption",
                  captionAlign,
                )}
                className="text-textPrimary"
              >
                {caption}
              </Typography>
            </ComponentLayoutNode>
          ) : null}
        </figure>
      </div>
    </section>
  );
}
