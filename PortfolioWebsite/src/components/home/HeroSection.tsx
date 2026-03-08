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
  const resolvedImagePreset = normalizeImagePreset(imagePreset);
  const outerSectionClassName = editMode
    ? "relative w-full min-h-[540px] md:min-h-[620px] flex flex-col items-center justify-center px-0 overflow-hidden bg-black"
    : "relative w-full h-screen flex flex-col items-center justify-center px-0 overflow-hidden bg-black";
  const presetViewportClassName = resolvedImagePreset === "native"
    ? "h-full min-h-[540px]"
    : resolvedImagePreset === "ratio-21-9"
      ? "aspect-[21/9]"
      : "aspect-video";
  const viewportWrapperClassName = editMode
    ? `relative w-full overflow-hidden border-y border-white/5 bg-black shadow-none ${presetViewportClassName}`
    : `relative w-full overflow-hidden bg-black shadow-none ${isMobile ? "h-full" : `${presetViewportClassName} border-y border-white/5`}`;

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

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
        <div className={`absolute inset-0 z-20 mix-blend-normal flex flex-col justify-end ${editMode ? "pointer-events-auto pt-24 pb-16 md:pb-20" : "pointer-events-none pt-32 pb-20 md:pb-24"}`}>
          <div className="grid-container w-full relative">
            <motion.div
              className="col-span-4 md:col-start-3 md:col-span-9 flex flex-col justify-end md:translate-y-6"
              initial={editMode ? false : { opacity: 0 }}
              animate={editMode ? undefined : { opacity: 1 }}
              transition={editMode ? undefined : { duration: 1.5, delay: 0.5, ease: "easeOut" }}
            >
              <h1 className="font-gothic font-light text-[10vw] md:text-5xl lg:text-[5vw] tracking-[0.2em] text-white uppercase leading-[1.1] interactive pointer-events-auto">
                {title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-block w-8 md:w-16 h-px bg-white/40"></span>
                <h1 className="font-gothic font-light text-2xl md:text-3xl lg:text-4xl tracking-widest text-white/50 uppercase interactive pointer-events-auto">
                  {subtitle}
                </h1>
              </div>

              <motion.p
                className="mt-12 font-futura text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase max-w-sm interactive pointer-events-auto whitespace-pre-line"
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
