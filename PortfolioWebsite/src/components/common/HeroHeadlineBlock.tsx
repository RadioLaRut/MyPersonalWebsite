import type { ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import ComponentLayoutNode, {
  getComponentLabNodeAttributes,
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography, {
  type TypographyAlignmentValue,
} from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { resolveEditableText, toPlainText } from "@/lib/editable-text";
import {
  type ImageFitMode,
  type ImagePreset,
} from "@/lib/image-presentation";
import {
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getGridColumnClassName,
} from "@/lib/component-design-style";
import type { PublicMediaHint } from "@/lib/media-layout";
import { PUBLIC_COPY } from "@/lib/public-copy";

type HeroHeadlineBlockProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  subtitleAlign?: TypographyAlignmentValue;
  heroImage?: string;
  heroImagePreset?: ImagePreset;
  heroImageFitMode?: ImageFitMode;
  navLink?: string;
  navLinkLabel?: ReactNode;
  publicMediaHint?: PublicMediaHint;
  editMode?: boolean;
} & ComponentDesignOverride<"HeroHeadline"> & ComponentLayoutProps;

export default function HeroHeadlineBlock({
  eyebrow,
  componentLayout,
  title,
  subtitle,
  subtitleAlign = "left",
  heroImage,
  heroImagePreset,
  heroImageFitMode,
  navLink,
  navLinkLabel = PUBLIC_COPY.fallbacks.heroVideoLabel,
  publicMediaHint,
  editMode = false,
  design,
}: HeroHeadlineBlockProps) {
  const resolvedDesign = resolveComponentDesign("HeroHeadline", design);
  const resolvedEyebrow = resolveEditableText(
    eyebrow,
    PUBLIC_COPY.fallbacks.heroEyebrow,
  );
  const resolvedTitle = resolveEditableText(
    title,
    PUBLIC_COPY.fallbacks.heroTitle,
  );
  const resolvedSubtitle = resolveEditableText(
    subtitle,
    PUBLIC_COPY.fallbacks.heroSummary,
  );
  const resolvedHeroImage = typeof heroImage === "string" ? heroImage.trim() : "";
  const heroImageAlt = toPlainText(title) ?? PUBLIC_COPY.fallbacks.heroTitle;
  const contentBoundsClassName = getGridColumnClassName(resolvedDesign.contentBounds);

  return (
    <header
      className={`relative flex min-h-[calc(var(--site-viewport-unit)*85)] w-full items-center justify-center overflow-hidden bg-black ${
        getComponentSectionProfileClassName(componentLayout)
      }`}
      style={getComponentSectionStyle(componentLayout)}
    >
      {resolvedHeroImage ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          {...getComponentLabNodeAttributes(componentLayout, "media")}
        >
          <PresetImage
            src={resolvedHeroImage}
            alt={heroImageAlt}
            preset={heroImagePreset}
            fitMode={heroImageFitMode}
            fitModeByBreakpoint={{ base: "cover", lg: heroImageFitMode ?? "x" }}
            preload={publicMediaHint?.src === resolvedHeroImage && publicMediaHint.preload}
            mediaProfile="full-bleed"
            sizes={publicMediaHint?.src === resolvedHeroImage ? publicMediaHint.sizes : undefined}
            lockFrame={false}
            frameClassName="h-full w-full opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,1)_140%)]" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end pb-24 md:pb-32">
        <div className="grid-container w-full mix-blend-difference pointer-events-auto">
          <div
            className={componentLayout
              ? "col-span-12 grid-subgrid items-end"
              : `${contentBoundsClassName} flex flex-col items-start`}
          >
            {resolvedEyebrow ? (
              <ComponentLayoutNode
                layout={componentLayout}
                nodeId="eyebrow"
                className="w-full"
              >
                <Typography
                  as="p"
                  preset={getComponentLayoutTypography(componentLayout, "eyebrow")?.preset ?? "sans-body"}
                  size={getComponentLayoutTypography(componentLayout, "eyebrow")?.size ?? "label"}
                  weight="semantic"
                  wrapPolicy={getComponentLayoutTypography(componentLayout, "eyebrow")?.wrap ?? "label"}
                  align={getComponentLayoutAlignment(componentLayout, "eyebrow")}
                  className="text-white/50 tracking-[0.1em] uppercase"
                >
                  {resolvedEyebrow}
                </Typography>
              </ComponentLayoutNode>
            ) : null}
            {resolvedTitle ? (
              <ComponentLayoutNode
                gapFrom="eyebrow"
                layout={componentLayout}
                nodeId="title"
                className="w-full"
              >
                <Typography
                  as="h1"
                  preset={getComponentLayoutTypography(componentLayout, "title")?.preset ?? "luna-editorial"}
                  size={getComponentLayoutTypography(componentLayout, "title")?.size ?? "hero"}
                  weight="semantic"
                  wrapPolicy={getComponentLayoutTypography(componentLayout, "title")?.wrap ?? "heading"}
                  align={getComponentLayoutAlignment(componentLayout, "title")}
                  className="text-white uppercase"
                >
                  {resolvedTitle}
                </Typography>
              </ComponentLayoutNode>
            ) : null}
            {resolvedSubtitle ? (
              <ComponentLayoutNode
                gapFrom="title"
                layout={componentLayout}
                nodeId="subtitle"
                className="w-full"
              >
                <Typography
                  as="p"
                  preset={getComponentLayoutTypography(componentLayout, "subtitle")?.preset ?? "sans-body"}
                  size={getComponentLayoutTypography(componentLayout, "subtitle")?.size ?? "title-sm"}
                  weight="medium"
                  wrapPolicy={getComponentLayoutTypography(componentLayout, "subtitle")?.wrap ?? "prose"}
                  align={getComponentLayoutAlignment(componentLayout, "subtitle", subtitleAlign)}
                  className="max-w-3xl text-white/90"
                >
                  {resolvedSubtitle}
                </Typography>
              </ComponentLayoutNode>
            ) : null}
            {navLink ? (
              <ComponentLayoutNode
                alignmentTarget="box"
                gapFrom="subtitle"
                layout={componentLayout}
                nodeId="navLink"
              >
                <a
                  href={editMode ? undefined : navLink}
                  target={editMode ? undefined : "_blank"}
                  rel={editMode ? undefined : "noopener noreferrer"}
                  aria-disabled={editMode || undefined}
                  className={`${editMode ? "cursor-default" : "interactive hover:bg-white hover:text-black"} inline-grid place-items-center border border-white/20 bg-white/5 px-8 py-3.5 transition-colors mix-blend-normal backdrop-blur-sm`}
                >
                  <Typography
                    as="span"
                    preset={getComponentLayoutTypography(componentLayout, "navLink")?.preset ?? "sans-body"}
                    size={getComponentLayoutTypography(componentLayout, "navLink")?.size ?? "label"}
                    weight="semantic"
                    wrapPolicy={getComponentLayoutTypography(componentLayout, "navLink")?.wrap ?? "label"}
                    align="center"
                    className="text-current tracking-widest uppercase"
                  >
                    {navLinkLabel}
                  </Typography>
                </a>
              </ComponentLayoutNode>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
