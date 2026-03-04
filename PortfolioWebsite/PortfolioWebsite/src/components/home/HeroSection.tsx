"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

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
      className="relative w-full h-screen flex flex-col items-center justify-center px-0 overflow-hidden bg-black"
    >
      {/* Cinema Viewport Wrapper */}
      <div
        className={`relative w-full ${isMobile ? "h-full" : "aspect-[21/9] sm:aspect-cinema border-y border-white/5"} overflow-hidden bg-black shadow-none`}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ y, scale, opacity }}
        >
          {/* Vignette & Grain Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_120%)] pointer-events-none z-10" />

          <div className="absolute inset-0 bg-black/20 mix-blend-multiply pointer-events-none z-10" />

          <img
            src={
              isMobile
                ? "/images/Others/01.png"
                : "/images/封面和结尾/2026/作品集封面2026.png"
            }
            alt="Hero Background"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Front Content Overlay based on Grid */}
        <div className="absolute inset-0 z-20 mix-blend-normal pointer-events-none flex flex-col justify-end pt-32 pb-16">
          <div className="grid-container w-full relative">

            {/* Main Title - Spanning cols 3 to 11 on Desktop */}
            <motion.div
              className="col-span-4 md:col-start-3 md:col-span-9 flex flex-col justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            >
              <h1 className="font-gothic font-light text-[10vw] md:text-5xl lg:text-[5vw] tracking-[0.2em] text-white uppercase leading-[1.1] interactive pointer-events-auto">
                JIANG CHENGYAN
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-block w-8 md:w-16 h-px bg-white/40"></span>
                <h1 className="font-gothic font-light text-2xl md:text-3xl lg:text-4xl tracking-widest text-white/50 uppercase interactive pointer-events-auto">
                  PORTFOLIO
                </h1>
              </div>

              <motion.p
                className="mt-12 font-futura text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase max-w-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
              >
                GAME DIRECTOR<br />& DEVELOPER
              </motion.p>
            </motion.div>

            {/* Scroll Prompt - Anchored to specific column to break center symmetry */}
            <motion.div
              className="hidden md:flex absolute bottom-0 right-[4vw] md:right-auto md:col-start-11 flex-col items-center gap-4 h-full justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.5 }}
            >
              <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest mb-2 origin-bottom rotate-90 translate-y-[-40px]">
                Scroll
              </span>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
