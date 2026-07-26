import type { ReactNode } from "react";

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
  getComponentSectionProfileClassName,
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

  if (componentLayout) {
    const captionTypography = getComponentLayoutTypography(componentLayout, "caption");
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
        <section className={`relative min-h-[calc(var(--site-viewport-unit)*100)] w-full bg-black ${getComponentSectionProfileClassName(componentLayout)}`}>
          <div
            className="absolute inset-0"
            data-component-lab-node="media"
          >
            {media}
          </div>
          {hasCaption ? (
            <div className="grid-container absolute inset-x-0 bottom-6 z-10">
              <ComponentLayoutNode layout={componentLayout} nodeId="caption">
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
            </div>
          ) : null}
        </section>
      );
    }
    return (
      <section className={`w-full ${getComponentSectionProfileClassName(componentLayout)}`}>
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
