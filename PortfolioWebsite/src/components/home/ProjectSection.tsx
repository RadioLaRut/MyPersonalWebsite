"use client";
import React, { type ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset, normalizeImagePreset } from "@/lib/image-presentation";

interface ProjectSectionProps {
  title: ReactNode;
  imageSrc: string;
  subtitle?: ReactNode;
  link?: string;
  index?: number;
  align?: "auto" | "left" | "right";
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  editMode?: boolean;
}

export default function ProjectSection({
  title,
  imageSrc,
  subtitle,
  link,
  index = 0,
  align = "auto",
  imagePreset = "ratio-16-9",
  imageFitMode = "x",
  editMode = false,
}: ProjectSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageAlt = typeof title === "string" ? title : "Project cover";
  const resolvedImagePreset = normalizeImagePreset(imagePreset);
  const sectionClassName = editMode
    ? "relative m-0 grid min-h-[420px] w-full place-items-center overflow-hidden p-0 mix-blend-normal group cursor-default lg:min-h-[500px]"
    : "relative m-0 grid min-h-screen min-h-[100dvh] w-full place-items-center overflow-hidden p-0 mix-blend-normal group interactive cursor-pointer";
  const mediaLayerClassName = editMode
    ? "absolute inset-0 grid place-items-center px-0"
    : "absolute inset-0 grid place-items-center px-0";
  const frameClassName = resolvedImagePreset === "native"
    ? "w-full h-full"
    : "w-full";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const shouldAlignRight = align === "right" || (align === "auto" && index % 2 !== 0);
  const textColumnClassName = shouldAlignRight
    ? "lg:col-start-5 justify-items-end text-right"
    : "lg:col-start-2 justify-items-start";
  const subtitleClassName = shouldAlignRight ? "text-right" : "";
  const underlineClassName = shouldAlignRight ? "origin-right self-end" : "origin-left";

  const handleInteraction = () => {
    if (!editMode && link) {
      window.location.href = link;
    }
  };

  return (
    <section
      ref={containerRef}
      onClick={handleInteraction}
      className={sectionClassName}
    >
      <motion.div
        className={mediaLayerClassName}
        style={editMode ? undefined : { y, scale }}
      >
        {/* Environment ambient gradient/shadow to improve contrast */}
        <div className={`absolute inset-0 z-10 ${editMode ? "bg-black/55" : "bg-black/30 custom-blend transition-colors duration-1000 group-hover:bg-black/10"}`} />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />

        <PresetImage
          src={imageSrc}
          alt={imageAlt}
          priority={index === 0}
          preset={imagePreset}
          fitMode={imageFitMode}
          lockFrame={resolvedImagePreset !== "native"}
          frameClassName={frameClassName}
          imageClassName="select-none"
        />
      </motion.div>

      <motion.div
        style={editMode ? undefined : { opacity }}
        className={`absolute inset-0 z-20 grid content-center py-20 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div className={`grid-container w-full relative ${editMode ? "" : "mix-blend-difference"}`}>
          <div
            className={`col-span-4 lg:col-span-8 grid content-start ${textColumnClassName}`}
          >
            {subtitle && (
              <Typography
                as="p"
                preset="gothic-editorial"
                size="label"
                weight="display"
                wrapPolicy="label"
                className={`mb-3 text-textPrimary ${subtitleClassName}`}
              >
                {subtitle}
              </Typography>
            )}
            <Typography
              as="h2"
              preset="sans-body"
              size="hero"
              weight="strong"
              wrapPolicy="heading"
              align={shouldAlignRight ? "right" : "left"}
              className={`text-white antialiased tracking-wider [transform:translateZ(0)] ${editMode ? "max-w-full" : "origin-left lg:whitespace-nowrap transition-all duration-500 group-hover:tracking-[0.06em] group-hover:scale-[1.02]"}`}
            >
              {title}
            </Typography>
            <div className={`h-[1.5px] bg-white mt-3 ${editMode ? "w-1/3 max-w-40" : `w-0 transition-all duration-1000 ease-out group-hover:w-[45%] ${underlineClassName}`}`}></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
