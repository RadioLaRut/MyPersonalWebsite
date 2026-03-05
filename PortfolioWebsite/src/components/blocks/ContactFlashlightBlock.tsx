"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export interface ContactFlashlightBlockProps {
    maskRadius?: number;
    maskSmoothness?: number;
    darkTextColor?: string;
    lightTextColor?: string;
    name?: string;
    taglineText?: string;
    taglineSub?: string;
    email?: string;
    wechat?: string;
    experienceHistory?: { company: string; role: string }[];
    creativeDirection?: { title: string; subtitle: string }[];
}

export default function ContactFlashlightBlock({
    maskRadius = 500,
    maskSmoothness = 40,
    darkTextColor = "rgba(255,255,255,0.4)",
    lightTextColor = "rgba(255,255,255,1)",
    name = "JIANG CHENGYAN",
    taglineText = "艺术与科技 / 交互叙事设计 / 游戏设计",
    taglineSub = "CUC '2028",
    email = "3115437519@qq.com",
    wechat = "radiowithouthead",
    experienceHistory = [],
    creativeDirection = []
}: ContactFlashlightBlockProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });

    const handleCopy = async (value: string) => {
        if (typeof navigator === "undefined" || !navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Ignore clipboard failures to keep interaction non-blocking.
        }
    };

    useEffect(() => {
        let lastClientX = window.innerWidth / 2;
        let lastClientY = window.innerHeight / 2;

        const updatePosition = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const relativeX = lastClientX - rect.left;
            const relativeY = lastClientY - rect.top;
            const minX = -maskRadius;
            const maxX = rect.width + maskRadius;
            const minY = -maskRadius;
            const maxY = rect.height + maskRadius;
            const x = Math.min(Math.max(relativeX, minX), maxX);
            const y = Math.min(Math.max(relativeY, minY), maxY);
            setMousePos({ x: `${x}px`, y: `${y}px` });
        };

        const handleMouseMove = (e: MouseEvent) => {
            lastClientX = e.clientX;
            lastClientY = e.clientY;
            updatePosition();
        };

        const handleScroll = () => {
            updatePosition();
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("scroll", handleScroll);

        updatePosition();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [maskRadius]);

    const renderContentData = (isInteractiveLayer: boolean) => (
        <div className="grid-container w-full py-16 sm:py-32">
            <section className="col-span-4 md:col-start-3 md:col-span-8 flex flex-col gap-6 mb-16 sm:mb-24">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-[12vw] sm:text-[9vw] font-black tracking-tighter mix-blend-normal leading-none font-luna"
                >
                    {name}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="text-xl sm:text-2xl lg:text-3xl leading-[2] font-semibold text-left max-w-2xl mix-blend-normal font-serif tracking-widest mt-8"
                >
                    {taglineText}
                    <br />
                    <span className="text-sm font-mono opacity-50 tracking-[0.2em]">{taglineSub}</span>
                </motion.p>
            </section>

            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="col-span-4 md:col-start-4 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-16 text-left border-t border-current pt-16"
            >
                <div className="space-y-8">
                    <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
                        Experience History
                    </span>
                    <ul className="space-y-6 text-lg sm:text-xl font-medium mix-blend-normal leading-relaxed font-serif">
                        {experienceHistory.map((item, i) => (
                            <li key={i} className="flex flex-col">
                                <span>{item.company}</span>
                                <span className="text-sm font-mono opacity-50 mt-1">{item.role}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-8">
                    <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
                        Creative Direction
                    </span>
                    <ul className="space-y-6 text-lg sm:text-xl font-medium mix-blend-normal leading-relaxed font-serif tracking-wide">
                        {creativeDirection.map((item, i) => (
                            <li key={i} className="flex flex-col">
                                <span>{item.title}</span>
                                <span className="text-sm font-mono opacity-50 mt-1">{item.subtitle}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 1 }}
                className="col-span-4 md:col-start-6 md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-16 text-left border-t border-current pt-16 mt-24"
            >
                <div className="space-y-6">
                    <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
                        WeChat / Social
                    </span>
                    {isInteractiveLayer ? (
                        <button
                            type="button"
                            onClick={() => void handleCopy(wechat)}
                            className="text-2xl sm:text-3xl font-medium mix-blend-normal tracking-tight font-serif text-left break-all interactive hover-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm"
                            aria-label="Copy WeChat ID"
                        >
                            {wechat}
                        </button>
                    ) : (
                        <span className="text-2xl sm:text-3xl font-medium mix-blend-normal tracking-tight font-serif text-left break-all">
                            {wechat}
                        </span>
                    )}
                </div>

                <div className="space-y-6">
                    <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
                        Email / Contact
                    </span>
                    {isInteractiveLayer ? (
                        <a
                            href={`mailto:${email}`}
                            className="text-xl sm:text-2xl font-medium mix-blend-normal tracking-tight font-serif break-all interactive hover-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm"
                        >
                            {email}
                        </a>
                    ) : (
                        <span className="text-xl sm:text-2xl font-medium mix-blend-normal tracking-tight font-serif break-all">
                            {email}
                        </span>
                    )}
                </div>
            </motion.section>
        </div>
    );

    return (
        <div className="relative w-full overflow-hidden font-luna selection:bg-white selection:text-black">
            <div ref={containerRef} className="relative w-full mx-auto pb-12">
                {/* Base Layer (Dark Text) */}
                <div
                    className="z-10 transition-colors duration-300"
                    style={{ color: darkTextColor }}
                >
                    {renderContentData(true)}
                </div>

                {/* Reveal Layer (White Text masked by cursor) */}
                <div
                    className="absolute inset-0 z-20 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
                    aria-hidden="true"
                    style={{
                        color: lightTextColor,
                        WebkitMaskImage: `radial-gradient(${maskRadius}px circle at ${mousePos.x} ${mousePos.y}, black 0%, black ${maskSmoothness}%, transparent 100%)`,
                        maskImage: `radial-gradient(${maskRadius}px circle at ${mousePos.x} ${mousePos.y}, black 0%, black ${maskSmoothness}%, transparent 100%)`,
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                    }}
                >
                    {renderContentData(false)}
                </div>
            </div>
        </div>
    );
}
