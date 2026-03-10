"use client";
import React, { type ReactNode, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export interface ContactFlashlightBlockProps {
    maskRadius?: number;
    maskSmoothness?: number;
    darkTextColor?: string;
    lightTextColor?: string;
    name?: ReactNode;
    taglineText?: ReactNode;
    taglineSub?: ReactNode;
    email?: ReactNode;
    wechat?: ReactNode;
    experienceHistory?: { company: ReactNode; role: ReactNode }[];
    creativeDirection?: { title: ReactNode; subtitle: ReactNode }[];
    experienceContent?: ReactNode;
    creativeContent?: ReactNode;
}

export default function ContactFlashlightBlock({
    maskRadius = 500,
    maskSmoothness = 40,
    darkTextColor = "rgba(255,255,255,0.4)",
    lightTextColor = "rgba(255,255,255,1)",
    name,
    taglineText,
    taglineSub,
    email,
    wechat,
    experienceHistory = [],
    creativeDirection = [],
    experienceContent,
    creativeContent,
}: ContactFlashlightBlockProps) {
    const wechatTextClass = "copyable-contact block whitespace-nowrap text-[clamp(1.35rem,1.9vw,2.2rem)] font-medium mix-blend-normal tracking-tight leading-[1] font-serif text-left";
    const emailTextClass = "copyable-contact block whitespace-nowrap text-[clamp(1.25rem,1.75vw,2rem)] font-medium mix-blend-normal tracking-tight leading-[1] font-serif";
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        const checkTouchDevice = () => {
            const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
            const isSmallScreen = window.innerWidth < 1024;
            // 双保险策略：触摸设备或小屏幕都禁用探视灯效果
            setIsTouchDevice(isCoarsePointer || isSmallScreen);
        };
        checkTouchDevice();
        window.addEventListener("resize", checkTouchDevice);
        return () => window.removeEventListener("resize", checkTouchDevice);
    }, []);

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

    const renderContentData = () => (
        <div className="grid-container w-full py-16 sm:py-32">
            <section className="col-span-4 lg:col-start-3 lg:col-span-8 flex flex-col gap-6 mb-16 sm:mb-24">
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
                    className="text-xl sm:text-2xl lg:text-3xl leading-loose font-semibold text-left max-w-2xl mix-blend-normal font-serif tracking-widest mt-8"
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
                className="col-span-4 lg:col-start-4 lg:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-16 text-left border-t border-current pt-16"
            >
                <div className="space-y-8">
                    <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
                        Experience History
                    </span>
                    <div className="space-y-6 text-lg sm:text-xl font-medium mix-blend-normal leading-relaxed font-serif">
                        {experienceContent ? (
                            experienceContent
                        ) : (
                            experienceHistory.map((item, i) => (
                                <div key={i} className="flex flex-col">
                                    <span>{item.company}</span>
                                    <span className="text-sm font-mono opacity-50 mt-1">{item.role}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
                        Creative Direction
                    </span>
                    <div className="space-y-6 text-lg sm:text-xl font-medium mix-blend-normal leading-relaxed font-serif tracking-wide">
                        {creativeContent ? (
                            creativeContent
                        ) : (
                            creativeDirection.map((item, i) => (
                                <div key={i} className="flex flex-col">
                                    <span>{item.title}</span>
                                    <span className="text-sm font-mono opacity-50 mt-1">{item.subtitle}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 1 }}
                className="col-span-4 lg:col-start-4 lg:col-span-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-20 text-left border-t border-current pt-16 mt-24 items-start"
            >
                <div className="space-y-6">
                    <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
                        WeChat / Social
                    </span>
                    <span className={wechatTextClass}>
                        {wechat}
                    </span>
                </div>

                <div className="space-y-6">
                    <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
                        Email / Contact
                    </span>
                    <span className={emailTextClass}>
                        {email}
                    </span>
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
                    {renderContentData()}
                </div>

                {/* Reveal Layer (White Text masked by cursor) */}
                <div
                    className="absolute inset-0 z-20 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
                    aria-hidden="true"
                    style={{
                        color: lightTextColor,
                        WebkitMaskImage: isTouchDevice
                            ? "none"
                            : `radial-gradient(${maskRadius}px circle at ${mousePos.x} ${mousePos.y}, black 0%, black ${maskSmoothness}%, transparent 100%)`,
                        maskImage: isTouchDevice
                            ? "none"
                            : `radial-gradient(${maskRadius}px circle at ${mousePos.x} ${mousePos.y}, black 0%, black ${maskSmoothness}%, transparent 100%)`,
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                    }}
                >
                    {renderContentData()}
                </div>
            </div>
        </div>
    );
}
