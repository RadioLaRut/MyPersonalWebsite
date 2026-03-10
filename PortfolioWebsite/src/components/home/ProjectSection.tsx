"use client";
import React, { type ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PresetImage } from "@/components/common/PresetImage";
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
    ? "relative w-full min-h-[420px] lg:min-h-[500px] overflow-hidden flex items-center justify-center m-0 p-0 mix-blend-normal group cursor-default"
    : "relative w-full min-h-screen min-h-[100dvh] overflow-hidden flex items-center justify-center m-0 p-0 mix-blend-normal group interactive cursor-pointer";
  const mediaLayerClassName = editMode
    ? "absolute inset-0 flex items-center justify-center px-0"
    : "absolute inset-0 flex items-center justify-center px-0";
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
    ? "col-start-5 items-end text-right"
    : "col-start-2 items-start";
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
        className={`absolute inset-0 z-20 flex flex-col justify-center py-20 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div className={`grid-container w-full relative ${editMode ? "" : "mix-blend-difference"}`}>
          <div
            className={`col-span-8 flex flex-col ${textColumnClassName}`}
          >
            {subtitle && (
              <p className={`text-textPrimary font-gothic tracking-[0.4em] mb-4 text-xs sm:text-sm font-medium uppercase ${subtitleClassName}`}>
                {subtitle}
              </p>
            )}
            <h2 className={`text-[clamp(2rem,7vw,5rem)] font-futura font-black tracking-tight leading-[0.9] text-white antialiased [transform:translateZ(0)] ${editMode ? "whitespace-normal break-words max-w-full" : "origin-left lg:whitespace-nowrap transition-all duration-500 group-hover:tracking-normal group-hover:scale-[1.02]"}`}>
              {title}
            </h2>
            <div className={`h-1 bg-white mt-8 ${editMode ? "w-1/3 max-w-40" : `w-0 transition-all duration-700 ease-out group-hover:w-1/3 ${underlineClassName}`}`}></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
