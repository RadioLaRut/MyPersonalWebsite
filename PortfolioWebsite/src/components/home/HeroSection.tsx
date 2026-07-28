import React, { type ReactNode } from "react";

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
import { MotionLink } from "@/components/motion/MotionLink";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getResponsiveGridColumnClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";
import { motionClassNames } from "@/lib/motion/classes";

function getPosterTitleLines(title: ReactNode) {
  const plainTitle = toPlainText(title);
  if (!plainTitle) return null;
  const lines = plainTitle
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 1 ? lines : null;
}

export interface HeroSectionProps
  extends ComponentDesignOverride<"HeroSection">, ComponentLayoutProps {
  eyebrow?: ReactNode;
  positioning?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  description: ReactNode;
  descriptionAlign?: TypographyAlignment;
  primaryCtaLabel?: ReactNode;
  primaryCtaHref?: string;
  secondaryCtaLabel?: ReactNode;
  secondaryCtaHref?: string;
  imageSrc: string;
  imageAlt: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  mobileImageFocalX?: number;
  mobileImageFocalY?: number;
  publicMediaHint?: PublicMediaHint;
  editMode?: boolean;
  variant?: "full" | "poster";
}

export default function HeroSection({
  eyebrow,
  componentLayout,
  componentVariant,
  positioning,
  title,
  subtitle,
  description,
  descriptionAlign = "left",
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  imageSrc,
  imageAlt,
  imagePreset = "ratio-21-9",
  imageFitMode = "x",
  mobileImageFocalX = 28,
  mobileImageFocalY = 50,
  publicMediaHint,
  editMode = false,
  variant,
  design: designOverride,
}: HeroSectionProps) {
  const design = resolveComponentDesign("HeroSection", designOverride);
  const contentBoundsClassName = getResponsiveGridColumnClassName(
    design.contentBounds,
  );
  const hasSubtitle = hasEditableTextContent(subtitle);
  const hasPositioning = hasEditableTextContent(positioning);
  const hasDescription = hasEditableTextContent(description);
  const hasPrimaryCta = hasEditableTextContent(primaryCtaLabel) &&
    Boolean(primaryCtaHref);
  const hasSecondaryCta = hasEditableTextContent(secondaryCtaLabel) &&
    Boolean(secondaryCtaHref);
  const hasCta = hasPrimaryCta || hasSecondaryCta;
  const posterMode = !hasDescription && !hasCta;
  const resolvedVariant = componentVariant === "full" ||
      componentVariant === "poster"
    ? componentVariant
    : variant ?? (posterMode ? "poster" : "full");
  const posterTitleLines = posterMode && !hasSubtitle
    ? getPosterTitleLines(title)
    : null;
  const hasStackedPosterTitle = Boolean(
    posterTitleLines && posterTitleLines.length > 1,
  );
  const compactPosterTitle = toPlainText(title)?.replace(/\s+/g, "") ?? "";
  const hasLongPosterTitle = posterMode &&
    !hasSubtitle &&
    !hasStackedPosterTitle &&
    compactPosterTitle.length > 10;
  const posterTitleSize = hasStackedPosterTitle || !hasLongPosterTitle
    ? "hero"
    : "display";
  const eyebrowTopSpacing = getSpacingRem(design.eyebrowTopSpacing);
  const ctaTopSpacing = getSpacingRem(
    hasDescription ? design.ctaTopSpacing : "32",
  );
  const typography = (nodeId: string) =>
    getComponentLayoutTypography(componentLayout, nodeId);

  return (
    <section
      className="relative min-h-[calc(var(--site-viewport-unit)*100)] w-full overflow-hidden bg-black px-0"
      data-public-motion-kind={editMode ? undefined : "hero"}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="relative min-h-[calc(var(--site-viewport-unit)*100)] w-full overflow-hidden bg-black lg:border-y lg:border-white/5">
        <div
          className="absolute inset-x-0 -inset-y-[12%] overflow-hidden lg:inset-0"
          {...getComponentLabNodeAttributes(componentLayout, "media")}
          data-public-motion-media={editMode ? undefined : "true"}
        >
          <PresetImage
            src={imageSrc}
            alt={imageAlt}
            preload={publicMediaHint?.src === imageSrc &&
              publicMediaHint.preload}
            mediaProfile="full-bleed"
            sizes={publicMediaHint?.src === imageSrc
              ? publicMediaHint.sizes
              : undefined}
            preset={imagePreset}
            fitMode={imageFitMode}
            fitModeByBreakpoint={{ base: "cover", lg: imageFitMode }}
            objectPositionByBreakpoint={{
              base: { x: mobileImageFocalX, y: mobileImageFocalY },
              lg: { x: 50, y: 50 },
            }}
            lockFrame={false}
            frameClassName="h-full w-full"
            imageClassName="select-none"
            draggable={false}
          />
        </div>

        <div
          className={`absolute inset-0 z-20 grid ${
            getComponentSectionProfileClassName(componentLayout)
          } ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          <div className="grid-container relative h-full items-end text-edge-shadow lg:items-center">
            {resolvedVariant === "poster" ? (
              <div
                className={componentLayout
                  ? "contents"
                  : `${contentBoundsClassName} min-w-0 self-end grid auto-rows-max justify-items-end text-right lg:ml-auto lg:self-center`}
                data-hero-lead={editMode ? undefined : "true"}
              >
                <ComponentLayoutNode
                  layout={componentLayout}
                  nodeId="title"
                >
                  <Typography
                    as="h1"
                    preset={typography("title")?.preset ?? "luna-editorial"}
                    size={typography("title")?.size ?? posterTitleSize}
                    weight="semantic"
                    wrapPolicy={typography("title")?.wrap ??
                      (hasStackedPosterTitle ? "heading" : "label")}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      "title",
                      "right",
                    )}
                    className={hasSubtitle
                      ? "max-w-full text-white/14"
                      : "max-w-full text-white/92"}
                  >
                    {hasStackedPosterTitle
                      ? posterTitleLines!.map((line, index) => (
                        <React.Fragment key={`${line}-${index}`}>
                          {index > 0 ? <br /> : null}
                          {line}
                        </React.Fragment>
                      ))
                      : title}
                  </Typography>
                </ComponentLayoutNode>
                {hasSubtitle ? (
                  <ComponentLayoutNode
                    className="-mt-[1lh]"
                    layout={componentLayout}
                    nodeId="subtitle"
                  >
                    <Typography
                      as="p"
                      preset={typography("subtitle")?.preset ?? "sans-body"}
                      size={typography("subtitle")?.size ?? "title"}
                      weight="semantic"
                      wrapPolicy={typography("subtitle")?.wrap ?? "label"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        "subtitle",
                        "right",
                      )}
                      className="text-white/88"
                    >
                      {subtitle}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
                {hasPositioning ? (
                  <ComponentLayoutNode
                    gapFrom={hasSubtitle ? "subtitle" : "title"}
                    layout={componentLayout}
                    nodeId="positioning"
                    style={!componentLayout
                      ? { marginTop: eyebrowTopSpacing }
                      : undefined}
                  >
                    <Typography
                      as="p"
                      preset={typography("positioning")?.preset ?? "sans-body"}
                      size={typography("positioning")?.size ?? "body-sm"}
                      weight="semantic"
                      wrapPolicy={typography("positioning")?.wrap ?? "prose"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        "positioning",
                        "right",
                      )}
                      className="max-w-[26rem] text-white/76"
                    >
                      {positioning}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(eyebrow) ? (
                  <ComponentLayoutNode
                    gapFrom={hasPositioning
                      ? "positioning"
                      : hasSubtitle
                        ? "subtitle"
                        : "title"}
                    layout={componentLayout}
                    nodeId="eyebrow"
                    style={!componentLayout
                      ? {
                        marginTop: hasPositioning
                          ? getSpacingRem("12")
                          : eyebrowTopSpacing,
                      }
                      : undefined}
                  >
                    <Typography
                      as="p"
                      preset={typography("eyebrow")?.preset ?? "sans-body"}
                      size={typography("eyebrow")?.size ?? "caption"}
                      weight="semantic"
                      wrapPolicy={typography("eyebrow")?.wrap ?? "prose"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        "eyebrow",
                        "right",
                      )}
                      className={`${
                        hasStackedPosterTitle
                          ? "max-w-[20rem]"
                          : hasLongPosterTitle
                            ? "max-w-[24rem]"
                            : "max-w-[28rem]"
                      } text-white/58`}
                    >
                      {eyebrow}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
              </div>
            ) : (
              <div
                className={componentLayout
                  ? "contents"
                  : `${contentBoundsClassName} self-center grid max-w-[28rem] auto-rows-max justify-items-start sm:max-w-[31rem] lg:ml-auto lg:max-w-[36rem]`}
                data-hero-lead={editMode ? undefined : "true"}
              >
                {hasEditableTextContent(eyebrow) ? (
                  <ComponentLayoutNode
                    layout={componentLayout}
                    nodeId="eyebrow"
                  >
                    <Typography
                      as="p"
                      preset={typography("eyebrow")?.preset ?? "sans-body"}
                      size={typography("eyebrow")?.size ?? "caption"}
                      weight="semantic"
                      wrapPolicy={typography("eyebrow")?.wrap ?? "label"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        "eyebrow",
                      )}
                      className="text-white/56"
                    >
                      {eyebrow}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
                <ComponentLayoutNode
                  gapFrom={hasEditableTextContent(eyebrow)
                    ? "eyebrow"
                    : undefined}
                  layout={componentLayout}
                  nodeId="title"
                  style={!componentLayout ? { marginTop: "0.75rem" } : undefined}
                >
                  <Typography
                    as="h1"
                    preset={typography("title")?.preset ?? "luna-editorial"}
                    size={typography("title")?.size ?? "display"}
                    weight="semantic"
                    wrapPolicy={typography("title")?.wrap ?? "heading"}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      "title",
                    )}
                    className="w-fit max-w-none text-white"
                  >
                    {title}
                  </Typography>
                </ComponentLayoutNode>
                {hasSubtitle ? (
                  <ComponentLayoutNode
                    className="inline-grid grid-flow-col auto-cols-max items-center gap-3"
                    gapFrom="title"
                    layout={componentLayout}
                    nodeId="subtitle"
                    style={!componentLayout ? { marginTop: "1rem" } : undefined}
                  >
                    <span className="h-px w-8 bg-white/44" />
                    <Typography
                      as="p"
                      preset={typography("subtitle")?.preset ?? "sans-body"}
                      size={typography("subtitle")?.size ?? "label"}
                      weight="semantic"
                      wrapPolicy={typography("subtitle")?.wrap ?? "label"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        "subtitle",
                      )}
                      className="text-white/84"
                    >
                      {subtitle}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
                {hasDescription ? (
                  <ComponentLayoutNode
                    gapFrom={hasSubtitle ? "subtitle" : "title"}
                    layout={componentLayout}
                    nodeId="description"
                    style={!componentLayout ? { marginTop: "1rem" } : undefined}
                  >
                    <Typography
                      as="p"
                      preset={typography("description")?.preset ?? "sans-body"}
                      size={typography("description")?.size ?? "body"}
                      weight="semantic"
                      wrapPolicy={typography("description")?.wrap ?? "prose"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        "description",
                        descriptionAlign,
                      )}
                      className="max-w-[24rem] whitespace-pre-line text-white/76"
                    >
                      {description}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
                {hasPrimaryCta && primaryCtaHref ? (
                  <ComponentLayoutNode
                    alignmentTarget="box"
                    gapFrom={hasDescription
                      ? "description"
                      : hasSubtitle
                        ? "subtitle"
                        : "title"}
                    layout={componentLayout}
                    nodeId="primaryCta"
                    style={!componentLayout
                      ? { marginTop: ctaTopSpacing }
                      : undefined}
                  >
                    <MotionLink
                      href={primaryCtaHref}
                      disabled={editMode}
                      className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-white/92 hover:text-white"
                    >
                      <span
                        className={`h-px w-7 bg-white/52 ${motionClassNames.fastAll} group-hover:w-11 group-hover:bg-white`}
                      />
                      <Typography
                        preset={typography("primaryCta")?.preset ?? "sans-body"}
                        size={typography("primaryCta")?.size ?? "label"}
                        weight="semantic"
                        wrapPolicy={typography("primaryCta")?.wrap ?? "label"}
                        align="center"
                        className="text-inherit"
                      >
                        {primaryCtaLabel}
                      </Typography>
                    </MotionLink>
                  </ComponentLayoutNode>
                ) : null}
                {hasSecondaryCta && secondaryCtaHref ? (
                  <ComponentLayoutNode
                    alignmentTarget="box"
                    gapFrom={hasPrimaryCta
                      ? "primaryCta"
                      : hasDescription
                        ? "description"
                        : "title"}
                    layout={componentLayout}
                    nodeId="secondaryCta"
                    style={!componentLayout && !hasPrimaryCta
                      ? { marginTop: ctaTopSpacing }
                      : undefined}
                  >
                    <MotionLink
                      href={secondaryCtaHref}
                      disabled={editMode}
                      className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-white/48 hover:text-white"
                    >
                      <span
                        className={`h-px w-7 bg-white/18 ${motionClassNames.fastAll} group-hover:w-11 group-hover:bg-white`}
                      />
                      <Typography
                        preset={typography("secondaryCta")?.preset ??
                          "sans-body"}
                        size={typography("secondaryCta")?.size ?? "label"}
                        weight="semantic"
                        wrapPolicy={typography("secondaryCta")?.wrap ?? "label"}
                        align="center"
                        className="text-inherit"
                      >
                        {secondaryCtaLabel}
                      </Typography>
                    </MotionLink>
                  </ComponentLayoutNode>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
