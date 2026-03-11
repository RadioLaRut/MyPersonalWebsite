"use client";
import Link from "next/link";
import React, { type ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

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
  const outerSectionClassName = editMode
    ? "relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-black px-0 lg:min-h-[720px]"
    : "relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-black px-0";

  const viewportWrapperClassName = editMode
    ? "relative flex-1 overflow-hidden border-y border-white/5 bg-black"
    : "relative flex-1 overflow-hidden bg-black lg:border-y lg:border-white/5";

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
        <motion.div
          className="absolute inset-0 h-full w-full"
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

        <div className={`absolute inset-0 z-20 flex flex-col justify-end ${editMode ? "pointer-events-auto pt-24 pb-24 lg:pb-28" : "pointer-events-none pt-32 pb-24 lg:pb-28"}`}>
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
                    weight="medium"
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
                  weight="display"
                  wrapPolicy="heading"
                  className="mt-5 text-white"
                >
                  {title}
                </Typography>
                <div className="mt-6 flex items-center gap-4">
                  <span className="h-px w-8 bg-white/35 lg:w-16"></span>
                  <Typography
                    as="p"
                    preset="sans-body"
                    size="caption"
                    weight="medium"
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
                <div className="flex flex-col items-start lg:pl-4">
                  <Typography
                    as="p"
                    preset="sans-body"
                    size="body-lg"
                    weight="regular"
                    wrapPolicy="prose"
                    className="text-textPrimary/90 whitespace-pre-line"
                  >
                    {description}
                  </Typography>
                  {(primaryCtaLabel || secondaryCtaLabel) ? (
                    <div className={`mt-10 flex flex-wrap gap-6 ${editMode ? "pointer-events-auto" : "pointer-events-auto"}`}>
                      {primaryCtaLabel && primaryCtaHref ? (
                        <Link
                          href={primaryCtaHref}
                          onClick={(event) => {
                            if (editMode) {
                              event.preventDefault();
                            }
                          }}
                          className="group interactive inline-flex items-center gap-3 text-textPrimary transition-colors duration-300 hover:text-white"
                        >
                          <span className="h-px w-6 bg-white/40 transition-all duration-300 group-hover:w-10 group-hover:bg-white"></span>
                          <Typography
                            preset="sans-body"
                            size="label"
                            weight="medium"
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
                          className="group interactive inline-flex items-center gap-3 text-textMuted transition-colors duration-300 hover:text-white"
                        >
                          <span className="h-px w-6 bg-white/20 transition-all duration-300 group-hover:w-10 group-hover:bg-white"></span>
                          <Typography
                            preset="sans-body"
                            size="label"
                            weight="medium"
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
    </section>
  );
}
