import type { ReactNode } from "react";

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
} & ComponentDesignOverride<"ImagePanel">;

export default function ImagePanel({
  src,
  alt,
  caption,
  captionAlign = "left",
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
