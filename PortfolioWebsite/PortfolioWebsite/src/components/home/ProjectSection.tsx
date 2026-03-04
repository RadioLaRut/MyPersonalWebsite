"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ProjectSectionProps {
  title: string;
  imageSrc: string;
  subtitle?: string;
  link?: string;
  index?: number;
}

export default function ProjectSection({
  title,
  imageSrc,
  subtitle,
  link,
  index = 0,
}: ProjectSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);

  const handleInteraction = () => {
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <section
      ref={containerRef}
      onClick={handleInteraction}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center m-0 p-0 mix-blend-normal interactive cursor-pointer group"
    >
      <motion.div
        className="absolute inset-0 w-full h-[140%] -top-[20%]"
        style={{ y, scale }}
      >
        {/* Environment ambient gradient/shadow to improve contrast */}
        <div className="absolute inset-0 bg-black/30 z-10 custom-blend group-hover:bg-black/10 transition-colors duration-1000" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />

        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-contain select-none"
        />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-center py-20"
      >
        <div className="grid-container w-full relative mix-blend-difference">
          {/* Asymmetric Alignment Logic */}
          <div
            className={`col-span-4 md:col-span-8 flex flex-col ${index % 2 === 0
              ? "md:col-start-2 items-start"
              : "md:col-start-5 items-end text-right"
              }`}
          >
            {subtitle && (
              <p className={`text-white/70 font-gothic tracking-[0.4em] mb-4 text-xs sm:text-sm font-medium uppercase ${index % 2 !== 0 && "text-right"}`}>
                {subtitle}
              </p>
            )}
            <h2 className="text-[12vw] sm:text-[8vw] lg:text-[7vw] font-futura font-black tracking-tighter leading-[0.9] text-white transition-all duration-500 antialiased [transform:translateZ(0)] group-hover:tracking-normal group-hover:scale-[1.02] origin-left whitespace-nowrap">
              {title}
            </h2>
            <div className={`w-0 h-1 bg-white mt-8 transition-all duration-700 ease-out group-hover:w-1/3 ${index % 2 === 0 ? "origin-left" : "origin-right self-end"}`}></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
