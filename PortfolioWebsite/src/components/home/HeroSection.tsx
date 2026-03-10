"use client";
import React, { type ReactNode, useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset, normalizeImagePreset } from "@/lib/image-presentation";

export interface HeroSectionProps {
  title: ReactNode;
  subtitle: ReactNode;
  description: ReactNode;
  imageSrc: string;
  imageAlt: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  editMode?: boolean;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  imagePreset = "ratio-21-9",
  imageFitMode = "x",
  editMode = false,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  // We will manage everything through native CSS flex and absolute positioning
  // to prevent react re-render flashes on orientation changes.
  const outerSectionClassName = editMode
    ? "relative w-full lg:min-h-[620px] min-h-[100dvh] flex flex-col px-0 overflow-hidden bg-black"
    : "relative w-full min-h-[100dvh] flex flex-col px-0 overflow-hidden bg-black";

  // The wrapper takes the full available height of the section.
  // In PC mode, we maintain the cinematic border.
  const viewportWrapperClassName = editMode
    ? `relative flex-1 w-full overflow-hidden border-y border-white/5 bg-black shadow-none`
    : `relative flex-1 w-full overflow-hidden bg-black shadow-none lg:border-y lg:border-white/5`;

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
      {/* Cinema Viewport Wrapper */}
      <div className={viewportWrapperClassName}>
        <motion.div
          className="absolute inset-0 w-full h-full"
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
        </motion.div>

        {/* Front Content Overlay based on Grid */}
        <div className={`absolute inset-0 z-20 mix-blend-normal flex flex-col justify-end ${editMode ? "pointer-events-auto pt-24 pb-24 lg:pb-28" : "pointer-events-none pt-32 pb-24 lg:pb-28"}`}>
          <div className="grid-container w-full relative">
            <motion.div
              className="col-start-2 col-span-10 flex flex-col justify-end lg:translate-y-6"
              initial={editMode ? false : { opacity: 0 }}
              animate={editMode ? undefined : { opacity: 1 }}
              transition={editMode ? undefined : { duration: 1.5, delay: 0.5, ease: "easeOut" }}
            >
              <h1 className="font-gothic font-light text-[clamp(1.75rem,5vw,3.5rem)] tracking-[0.1em] lg:tracking-[0.2em] text-white uppercase leading-[1.1] select-none break-words hyphens-auto">
                {title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-block w-8 lg:w-16 h-px bg-white/40"></span>
                <h1 className="font-gothic font-light text-[clamp(1rem,2.5vw,1.5rem)] tracking-[0.1em] lg:tracking-widest text-textMuted uppercase select-none">
                  {subtitle}
                </h1>
              </div>

              <motion.p
                className="mt-10 lg:mt-12 font-futura text-textMuted text-xs lg:text-sm tracking-[0.2em] lg:tracking-[0.3em] uppercase w-full md:max-w-md lg:max-w-sm select-none whitespace-pre-line"
                initial={editMode ? false : { opacity: 0, x: -20 }}
                animate={editMode ? undefined : { opacity: 1, x: 0 }}
                transition={editMode ? undefined : { duration: 1.5, delay: 1, ease: "easeOut" }}
              >
                {description}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
