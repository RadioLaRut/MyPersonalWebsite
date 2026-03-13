"use client";
import Link from "next/link";
import React, { type ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

function getHeroStageSizingClassName(
  imagePreset: ImagePreset,
  imageFitMode: ImageFitMode,
) {
  if (imageFitMode !== "x") {
    return "relative h-full w-full";
  }

  if (imagePreset === "ratio-21-9") {
    return "relative h-full w-full lg:h-[min(100%,max(32rem,calc(100vw*9/21)))]";
  }

  if (imagePreset === "ratio-16-9") {
    return "relative h-full w-full lg:h-[min(100%,max(34rem,calc(100vw*9/16)))]";
  }

  return "relative h-full w-full";
}

export interface HeroSectionProps {
  eyebrow?: ReactNode;
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
  editMode?: boolean;
}

export default function HeroSection({
  eyebrow,
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
  editMode = false,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroStageSizingClassName = getHeroStageSizingClassName(imagePreset, imageFitMode);

  const baseOuterClasses = "relative min-h-[100dvh] w-full overflow-hidden bg-black px-0";
  const outerSectionClassName = editMode ? `${baseOuterClasses} lg:min-h-[720px]` : baseOuterClasses;

  const baseViewportClasses = "relative min-h-[100dvh] w-full overflow-hidden bg-black";
  const viewportWrapperClassName = editMode
    ? `${baseViewportClasses} border-y border-white/5 lg:min-h-[720px]`
    : `${baseViewportClasses} lg:border-y lg:border-white/5`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section
      ref={containerRef}
      className={outerSectionClassName}
    >
      <div className={viewportWrapperClassName}>
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <motion.div
            className={`${heroStageSizingClassName} overflow-hidden`}
            style={editMode ? undefined : { y, scale, opacity }}
          >
            <PresetImage
              src={imageSrc}
              alt={imageAlt}
              priority
              preset={imagePreset}
              fitMode={imageFitMode}
              lockFrame={false}
              frameClassName="h-full w-full"
              imageClassName="select-none"
              draggable={false}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.34)_36%,rgba(0,0,0,0.82)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.14),transparent_26%),radial-gradient(circle_at_78%_0%,rgba(255,255,255,0.1),transparent_18%)]" />
          </motion.div>
        </div>

        <div className={`absolute inset-0 z-20 flex items-center justify-center ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div className={`${heroStageSizingClassName} grid content-end rhythm-section-hero`}>
            <div className="grid-container relative w-full">
              <motion.div
                className="col-span-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end"
                initial={editMode ? false : { opacity: 0 }}
                animate={editMode ? undefined : { opacity: 1 }}
                transition={editMode ? undefined : { duration: 1.2, delay: 0.25, ease: "easeOut" }}
              >
                <div className="lg:col-span-7 lg:col-start-2">
                  {eyebrow ? (
                    <Typography
                      as="p"
                      preset="sans-body"
                      size="caption"
                      weight="semantic"
                      wrapPolicy="label"
                      className="text-white/42"
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
                    className="mt-6 text-white"
                  >
                    {title}
                  </Typography>
                  <div className="mt-7 grid grid-cols-[auto_1fr] items-center gap-4 lg:mt-8 lg:gap-5">
                    <span className="h-px w-10 bg-white/35 lg:w-20"></span>
                    <Typography
                      as="p"
                      preset="gothic-editorial"
                      size="label"
                      weight="semantic"
                      wrapPolicy="label"
                      className="text-textPrimary"
                    >
                      {subtitle}
                    </Typography>
                  </div>
                </div>

                <motion.div
                  className="lg:col-span-3 lg:col-start-10"
                  initial={editMode ? false : { opacity: 0, x: 24 }}
                  animate={editMode ? undefined : { opacity: 1, x: 0 }}
                  transition={editMode ? undefined : { duration: 1.1, delay: 0.45, ease: "easeOut" }}
                >
                  <div className="grid content-start justify-items-start">
                    <Typography
                      as="p"
                      preset="sans-body"
                      size="body"
                      weight="regular"
                      wrapPolicy="prose"
                      className="text-textPrimary/90 whitespace-pre-line"
                    >
                      {description}
                    </Typography>
                    {(primaryCtaLabel || secondaryCtaLabel) ? (
                      <div className="mt-12 grid gap-6 sm:grid-cols-2 pointer-events-auto">
                        {primaryCtaLabel && primaryCtaHref ? (
                          <Link
                            href={primaryCtaHref}
                            onClick={(event) => {
                              if (editMode) {
                                event.preventDefault();
                              }
                            }}
                            className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-textPrimary transition-colors duration-300 hover:text-white"
                          >
                            <span className="h-px w-6 bg-white/40 transition-all duration-300 group-hover:w-10 group-hover:bg-white"></span>
                            <Typography
                              preset="sans-body"
                              size="label"
                              weight="semantic"
                              wrapPolicy="label"
                              className="text-inherit"
                            >
                              {primaryCtaLabel}
                            </Typography>
                          </Link>
                        ) : null}
                        {secondaryCtaLabel && secondaryCtaHref ? (
                          <Link
                            href={secondaryCtaHref}
                            onClick={(event) => {
                              if (editMode) {
                                event.preventDefault();
                              }
                            }}
                            className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-textMuted transition-colors duration-300 hover:text-white"
                          >
                            <span className="h-px w-6 bg-white/20 transition-all duration-300 group-hover:w-10 group-hover:bg-white"></span>
                            <Typography
                              preset="sans-body"
                              size="label"
                              weight="semantic"
                              wrapPolicy="label"
                              className="text-inherit"
                            >
                              {secondaryCtaLabel}
                            </Typography>
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
