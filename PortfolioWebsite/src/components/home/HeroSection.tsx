"use client";
import React, { type ReactNode, useRef } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import { MotionLink } from "@/components/motion";
import {
  getResponsiveGridColumnClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { toPlainText } from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import {
  heroLeadVariants,
  heroSupportingVariants,
  motion,
  motionClassNames,
  motionScrollTokens,
  useScroll,
  useTransform,
} from "@/lib/motion";

function hasNodeContent(value: ReactNode) {
  if (value === null || value === undefined || value === false) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

function getPosterTitleLines(title: ReactNode) {
  const plainTitle = toPlainText(title);

  if (!plainTitle) {
    return null;
  }

  const lines = plainTitle
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 1 ? lines : null;
}

export interface HeroSectionProps {
  eyebrow?: ReactNode;
  positioning?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  description: ReactNode;
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
  editMode?: boolean;
}

export default function HeroSection({
  eyebrow,
  positioning,
  title,
  subtitle,
  description,
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
  editMode = false,
}: HeroSectionProps) {
  const design = useComponentDesign("HeroSection");
  const containerRef = useRef<HTMLDivElement>(null);
  const contentBoundsClassName = getResponsiveGridColumnClassName(design.contentBounds);
  const hasSubtitle = hasNodeContent(subtitle);
  const hasPositioning = hasNodeContent(positioning);
  const hasDescription = hasNodeContent(description);
  const hasPrimaryCta = hasNodeContent(primaryCtaLabel) && Boolean(primaryCtaHref);
  const hasSecondaryCta = hasNodeContent(secondaryCtaLabel) && Boolean(secondaryCtaHref);
  const hasCta = hasPrimaryCta || hasSecondaryCta;
  const posterMode = !hasDescription && !hasCta;
  const posterTitleLines = posterMode && !hasSubtitle ? getPosterTitleLines(title) : null;
  const hasStackedPosterTitle = Boolean(posterTitleLines && posterTitleLines.length > 1);
  const plainTitle = toPlainText(title);
  const compactPosterTitle = plainTitle?.replace(/\s+/g, "") ?? "";
  const hasLongPosterTitle =
    posterMode &&
    !hasSubtitle &&
    !hasStackedPosterTitle &&
    compactPosterTitle.length > 10;
  const posterTitleSize = hasStackedPosterTitle ? "hero" : hasLongPosterTitle ? "display" : "hero";
  const eyebrowTopSpacing = getSpacingRem(design.eyebrowTopSpacing);
  const ctaTopSpacing = getSpacingRem(hasDescription ? design.ctaTopSpacing : "32");

  const baseOuterClasses = "relative min-h-[100svh] w-full overflow-hidden bg-black px-0";
  const outerSectionClassName = editMode ? `${baseOuterClasses} lg:min-h-[720px]` : baseOuterClasses;

  const baseViewportClasses = "relative min-h-[100svh] w-full overflow-hidden bg-black";
  const viewportWrapperClassName = editMode
    ? `${baseViewportClasses} border-y border-white/5 lg:min-h-[720px]`
    : `${baseViewportClasses} lg:border-y lg:border-white/5`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    motionScrollTokens.heroMedia.input,
    motionScrollTokens.heroMedia.y,
  );
  const scale = useTransform(
    scrollYProgress,
    motionScrollTokens.heroMedia.input,
    motionScrollTokens.heroMedia.scale,
  );

  return (
    <section
      ref={containerRef}
      className={outerSectionClassName}
    >
      <div className={viewportWrapperClassName}>
        <motion.div
          className="absolute inset-x-0 -inset-y-[12%] overflow-hidden lg:inset-0"
          style={editMode ? undefined : { y, scale }}
        >
          <PresetImage
            src={imageSrc}
            alt={imageAlt}
            priority
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
        </motion.div>

        <div className={`absolute inset-0 z-20 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div className="grid-container relative h-full items-end rhythm-section-hero lg:items-center">
            {posterMode ? (
              <motion.div
                className={`${contentBoundsClassName} min-w-0 self-end grid auto-rows-max justify-items-end text-right text-edge-shadow lg:ml-auto lg:self-center`}
                initial={editMode ? false : "hidden"}
                animate={editMode ? undefined : "visible"}
                variants={heroLeadVariants}
              >
                {hasSubtitle ? (
                  <div className="relative w-fit">
                    <Typography
                      as="h1"
                      preset="luna-editorial"
                      size={posterTitleSize}
                      weight="semantic"
                      wrapPolicy="label"
                      align="right"
                      className="text-white/14"
                    >
                      {title}
                    </Typography>

                    <div className="absolute inset-0 grid place-items-center">
                      <Typography
                        as="p"
                        preset="sans-body"
                        size="title"
                        weight="semantic"
                        wrapPolicy="label"
                        align="right"
                        className="text-white/88"
                      >
                        {subtitle}
                      </Typography>
                    </div>
                  </div>
                ) : (
                  <Typography
                    as="h1"
                    preset="luna-editorial"
                    size={posterTitleSize}
                    weight="semantic"
                    wrapPolicy={hasStackedPosterTitle ? "heading" : "label"}
                    align="right"
                    className={hasStackedPosterTitle ? "max-w-full text-white/92 leading-[0.92]" : "max-w-full text-white/92"}
                  >
                    {hasStackedPosterTitle
                      ? (
                        <>
                          {posterTitleLines!.map((line, index) => (
                            <React.Fragment key={`${line}-${index}`}>
                              {index > 0 ? <br /> : null}
                              {line}
                            </React.Fragment>
                          ))}
                        </>
                        )
                      : title}
                  </Typography>
                )}

                {hasPositioning ? (
                  <Typography
                    as="p"
                    preset="sans-body"
                    size="body-sm"
                    weight="semantic"
                    wrapPolicy="prose"
                    className="max-w-[26rem] text-white/76"
                    align="right"
                    style={{ marginTop: eyebrowTopSpacing }}
                  >
                    {positioning}
                  </Typography>
                ) : null}

                {eyebrow ? (
                  <Typography
                    as="p"
                    preset="sans-body"
                    size="caption"
                    weight="semantic"
                    wrapPolicy="prose"
                    className={`${hasStackedPosterTitle ? "max-w-[20rem]" : hasLongPosterTitle ? "max-w-[24rem]" : "max-w-[28rem]"} text-white/58`}
                    align="right"
                    style={{ marginTop: hasPositioning ? getSpacingRem("12") : eyebrowTopSpacing }}
                  >
                    {eyebrow}
                  </Typography>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                className={`${contentBoundsClassName} self-center grid max-w-[28rem] auto-rows-max justify-items-start text-edge-shadow sm:max-w-[31rem] lg:ml-auto lg:max-w-[36rem]`}
                initial={editMode ? false : "hidden"}
                animate={editMode ? undefined : "visible"}
                variants={heroLeadVariants}
              >
                {eyebrow ? (
                  <Typography
                    as="p"
                    preset="sans-body"
                    size="caption"
                    weight="semantic"
                    wrapPolicy="label"
                    className="text-white/56"
                  >
                    {eyebrow}
                  </Typography>
                ) : null}

                <Typography
                  as="h1"
                  preset="luna-editorial"
                  size="display"
                  weight="semantic"
                  wrapPolicy="heading"
                  className="mt-3 w-fit max-w-none text-white"
                >
                  {title}
                </Typography>

                {hasSubtitle ? (
                  <div className="mt-4 inline-grid grid-flow-col auto-cols-max items-center gap-3">
                    <span className="h-px w-8 bg-white/44" />
                    <Typography
                      as="p"
                      preset="sans-body"
                      size="label"
                      weight="semantic"
                      wrapPolicy="label"
                      className="text-white/84"
                    >
                      {subtitle}
                    </Typography>
                  </div>
                ) : null}

                <motion.div
                  className="grid auto-rows-max justify-items-start"
                  initial={editMode ? false : "hidden"}
                  animate={editMode ? undefined : "visible"}
                  variants={heroSupportingVariants}
                >
                  <div className="grid content-start justify-items-start">
                    {hasDescription ? (
                      <Typography
                        as="p"
                        preset="sans-body"
                        size="body"
                        weight="semantic"
                        wrapPolicy="prose"
                        className="mt-4 max-w-[24rem] text-white/76 whitespace-pre-line"
                      >
                        {description}
                      </Typography>
                    ) : null}

                    {hasCta ? (
                      <div
                        className="pointer-events-auto flex flex-wrap items-center gap-x-7 gap-y-4"
                        style={{ marginTop: ctaTopSpacing }}
                      >
                        {hasPrimaryCta ? (
                          <MotionLink
                            href={primaryCtaHref!}
                            disabled={editMode}
                            className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-white/92 hover:text-white"
                          >
                            <span className={`h-px w-7 bg-white/52 ${motionClassNames.fastAll} group-hover:w-11 group-hover:bg-white`} />
                            <Typography
                              preset="sans-body"
                              size="label"
                              weight="semantic"
                              wrapPolicy="label"
                              className="text-inherit"
                            >
                              {primaryCtaLabel}
                            </Typography>
                          </MotionLink>
                        ) : null}

                        {hasSecondaryCta ? (
                          <MotionLink
                            href={secondaryCtaHref!}
                            disabled={editMode}
                            className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-white/48 hover:text-white"
                          >
                            <span className={`h-px w-7 bg-white/18 ${motionClassNames.fastAll} group-hover:w-11 group-hover:bg-white`} />
                            <Typography
                              preset="sans-body"
                              size="label"
                              weight="semantic"
                              wrapPolicy="label"
                              className="text-inherit"
                            >
                              {secondaryCtaLabel}
                            </Typography>
                          </MotionLink>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
