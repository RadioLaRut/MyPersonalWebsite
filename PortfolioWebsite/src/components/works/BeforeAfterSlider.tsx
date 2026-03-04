"use client";
import React, { useState, useRef, useEffect } from "react";

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeAlt?: string;
    afterAlt?: string;
    className?: string;
}

export default function BeforeAfterSlider({
    beforeImage,
    afterImage,
    beforeAlt = "Before",
    afterAlt = "After",
    className = "",
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
        setSliderPosition(percent);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("touchend", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden select-none cursor-ew-resize group ${className}`}
            onMouseDown={(e) => {
                setIsDragging(true);
                handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
                setIsDragging(true);
                handleMove(e.touches[0].clientX);
            }}
        >
            {/* Base Image (After / Lit) - establishes the container height */}
            <img
                src={afterImage}
                alt={afterAlt}
                className="block w-full h-auto object-contain pointer-events-none"
                draggable={false}
            />

            {/* Overlay Image (Before / Unlit) */}
            <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={beforeImage}
                    alt={beforeAlt}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ width: "100%", height: "100%" }}
                    ref={(img) => {
                        if (img && containerRef.current) {
                            img.style.width = `${containerRef.current.clientWidth}px`;
                        }
                    }}
                    draggable={false}
                />
            </div>

            {/* Slider Handle (Minimalist pure professional style) */}
            <div
                className="absolute top-0 bottom-0 w-[1px] bg-white/50 backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 transition-colors group-hover:bg-white flex justify-center items-center"
                style={{ left: `${sliderPosition}%` }}
            >
                {/* Subtle touch target / visual indicator */}
                <div className="w-1.5 h-12 bg-white/70 rounded-full transition-all group-hover:h-16 group-hover:bg-white pointer-events-none" />

                {/* Subtle Labels, only show on hover */}
                <div className="absolute top-8 text-white/50 text-[10px] font-mono tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex gap-20">
                    <span className="pr-4">UNLIT</span>
                    <span className="pl-4">LIT</span>
                </div>
            </div>
        </div>
    );
}
