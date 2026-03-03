"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ProjectSectionProps {
    title: string;
    imageSrc: string;
    subtitle?: string;
    link?: string;
}

export default function ProjectSection({ title, imageSrc, subtitle, link }: ProjectSectionProps) {
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
                    className="w-full h-full object-cover select-none"
                />
            </motion.div>

            <motion.div
                style={{ opacity }}
                className="relative z-20 flex flex-col items-center justify-center px-4 mix-blend-difference pointer-events-none"
            >
                {subtitle && (
                    <p className="text-white/80 font-serif tracking-widest mb-4 text-base sm:text-2xl font-medium uppercase max-w-2xl text-center">
                        {subtitle}
                    </p>
                )}
                <h2 className="text-[12vw] sm:text-[9rem] font-black tracking-tighter leading-none text-white transition-opacity duration-300">
                    {title}
                </h2>
            </motion.div>
        </section>
    );
}
