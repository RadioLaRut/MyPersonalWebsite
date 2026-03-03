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
            <div className={`relative w-full ${isMobile ? 'h-full' : 'aspect-[21/9] sm:aspect-cinema border-y border-white/5'} overflow-hidden bg-black shadow-none`}>
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
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Title Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 mix-blend-normal">
                    <motion.h1
                        className="font-display font-light text-3xl md:text-5xl lg:text-7xl tracking-[0.2em] text-white uppercase text-center interactive"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    >
                        JIANG CHENGYAN <span className="opacity-20 mx-2 sm:mx-4">|</span> PORTFOLIO
                    </motion.h1>
                    <motion.p
                        className="mt-6 font-display text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                    >
                        GAME DIRECTOR & DEVELOPER
                    </motion.p>
                </div>
            </div>

            {/* Scroll Prompt */}
            <motion.div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.5 }}
            >
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest mb-2">Scroll</span>
                <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse" />
            </motion.div>
        </section>
    );
}
