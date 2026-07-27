import type { ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import ComponentLayoutNode, {
  getComponentLabNodeAttributes,
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
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
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

function hasActiveOverlayPositioning(
  componentLayout: ComponentLayoutProps["componentLayout"],
  nodeId: string,
  breakpoint: "desktop" | "mobile" | "tablet",
) {
  const positioning =
    componentLayout?.nodes[nodeId]?.positioning?.[breakpoint];
  return positioning?.mode === "overlay" &&
    (
      positioning.anchored === true ||
      positioning.anchor !== "center" ||
      positioning.offset !== 0
    );
}

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

  if (componentLayout) {
    const captionTypography = getComponentLayoutTypography(componentLayout, "caption");
    const captionDefaultOffsetClassName = [
      hasActiveOverlayPositioning(componentLayout, "caption", "mobile")
        ? "mb-0"
        : "mb-6",
      hasActiveOverlayPositioning(componentLayout, "caption", "tablet")
        ? "md:mb-0"
        : "md:mb-6",
      hasActiveOverlayPositioning(componentLayout, "caption", "desktop")
        ? "lg:mb-0"
        : "lg:mb-6",
    ].join(" ");
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
        frameClassName={variant === "fullscreen" ? "h-full w-full" : "w-full"}
        imageClassName="select-none"
      />
    );
    if (variant === "fullscreen") {
      return (
        <section
          className={`relative min-h-[calc(var(--site-viewport-unit)*100)] w-full bg-black ${getComponentSectionProfileClassName(componentLayout)}`}
          style={getComponentSectionStyle(componentLayout)}
        >
          <div
            className="absolute inset-0"
            {...getComponentLabNodeAttributes(componentLayout, "media")}
          >
            {media}
          </div>
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="grid-container h-full">
              {hasCaption ? (
                <ComponentLayoutNode
                  className={`pointer-events-auto self-end ${captionDefaultOffsetClassName}`}
                  layout={componentLayout}
                  nodeId="caption"
                >
                  <Typography
                    as="p"
                    preset={captionTypography?.preset ?? "sans-body"}
                    size={captionTypography?.size ?? "caption"}
                    weight="semantic"
                    wrapPolicy={captionTypography?.wrap ?? "prose"}
                    align={getComponentLayoutAlignment(componentLayout, "caption", captionAlign)}
                    className="bg-black/65 px-4 py-2 text-textPrimary"
                  >
                    {caption}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
            </div>
          </div>
        </section>
      );
    }
    return (
      <section
        className={`w-full ${getComponentSectionProfileClassName(componentLayout)}`}
        style={getComponentSectionStyle(componentLayout)}
      >
        <div className="grid-container items-start">
          <ComponentLayoutNode
            as="figure"
            layout={componentLayout}
            nodeId="media"
            className="overflow-hidden border border-white/10 bg-white/[0.02]"
          >
            {media}
          </ComponentLayoutNode>
          {hasCaption ? (
            <ComponentLayoutNode
              gapFrom="media"
              layout={componentLayout}
              nodeId="caption"
            >
              <Typography
                as="figcaption"
                preset={captionTypography?.preset ?? "sans-body"}
                size={captionTypography?.size ?? "caption"}
                weight="semantic"
                wrapPolicy={captionTypography?.wrap ?? "prose"}
                align={getComponentLayoutAlignment(componentLayout, "caption", captionAlign)}
                className="text-textPrimary"
              >
                {caption}
              </Typography>
            </ComponentLayoutNode>
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div className="relative h-full min-h-[calc(var(--site-viewport-unit)*100)] w-full bg-black">
        <div className="absolute inset-0">
          <PresetImage
            src={src}
            alt={imageAlt}
            preset={preset}
            fitMode={fitMode}
            fitModeByBreakpoint={{
              base: preset === "native" ? "x" : "cover",
              lg: fitMode ?? "x",
            }}
            preload={publicMediaHint?.src === src && publicMediaHint.preload}
            mediaProfile="full-bleed"
            sizes={publicMediaHint?.src === src ? publicMediaHint.sizes : undefined}
            lockFrame={false}
            frameClassName="h-full w-full pointer-events-none"
          />
        </div>
        {hasCaption ? (
          <div className="absolute bottom-5 right-5 bg-black/65 border border-white/15 px-4 py-2 md:bottom-8 md:right-8">
            <Typography preset="sans-body" size="label" weight="semantic" wrapPolicy="prose" align={captionAlign} className="text-textPrimary">
              {caption}
            </Typography>
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "large") {
    return (
      <section className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
        <div className="grid-container">
          <figure className={`${getResponsiveGridColumnClassName(createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            { leftCol: 2, rightCol: 11 },
            resolvedDesign.largeBounds,
          ))} overflow-hidden rounded-none border border-white/10 bg-white/[0.02]`}>
            <PresetImage
              alt={imageAlt}
              src={src}
              preset={preset}
              fitMode={fitMode}
              preload={publicMediaHint?.src === src && publicMediaHint.preload}
              mediaProfile="grid-10"
              sizes={publicMediaHint?.src === src ? publicMediaHint.sizes : undefined}
              frameClassName="w-full"
              imageClassName="select-none"
            />
            {hasCaption ? (
              <figcaption className="border-t border-white/10 px-5 py-4 md:px-6">
                <Typography preset="sans-body" size="caption" weight="semantic" wrapPolicy="prose" align={captionAlign} className="text-textPrimary">
                  {caption}
                </Typography>
              </figcaption>
            ) : null}
          </figure>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
      <div className="grid-container">
        <figure className={`${getResponsiveGridColumnClassName(createResponsiveGridBounds(
          { leftCol: 1, rightCol: 12 },
          { leftCol: 2, rightCol: 11 },
          resolvedDesign.contentBounds,
        ))} mx-auto w-full max-w-5xl overflow-hidden border border-white/15 bg-white/[0.03]`}>
          <PresetImage
            alt={imageAlt}
            src={src}
            preset={preset}
            fitMode={fitMode}
            preload={publicMediaHint?.src === src && publicMediaHint.preload}
            mediaProfile="grid-10"
            sizes={publicMediaHint?.src === src ? publicMediaHint.sizes : undefined}
          />
          {hasCaption ? (
            <figcaption className="border-t border-white/15 px-4 py-3">
              <Typography preset="sans-body" size="label" weight="semantic" wrapPolicy="prose" align={captionAlign} className="text-textPrimary">
                {caption}
              </Typography>
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  );
}
