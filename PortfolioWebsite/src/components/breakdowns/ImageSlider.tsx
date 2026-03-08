'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import {
    type ImageFitMode,
    type ImagePreset,
    getImageCanvasClassName,
    getImageElementClassName,
    getImagePresetFrameClassName,
    normalizeImageFitMode,
    normalizeImagePreset,
} from '@/lib/image-presentation';

interface ImageSliderProps {
    unlitSrc: string;
    litSrc: string;
    alt?: string;
    className?: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
}

export default function ImageSlider({
    unlitSrc,
    litSrc,
    alt = 'Image Comparison',
    className = "",
    imagePreset = "ratio-16-9",
    imageFitMode = "x",
}: ImageSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const resolvedPreset = normalizeImagePreset(imagePreset);
    const resolvedFitMode = normalizeImageFitMode(imageFitMode);
    const frameClassName = getImagePresetFrameClassName(resolvedPreset);
    const canvasClassName = getImageCanvasClassName(resolvedPreset);
    const imageClassName = getImageElementClassName(resolvedPreset, resolvedFitMode);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    return (
        <div className={`w-full flex justify-center my-16 ${className}`}>
            <div className="w-full max-w-5xl">
                <div
                    ref={containerRef}
                    className={`${frameClassName} cursor-ew-resize select-none`}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                >
                    {/* Lit Image (Background) */}
                    <div className="absolute inset-0">
                        {/* Fallback color/placeholder if no image */}
                        <div className="absolute inset-0 bg-neutral-900" />
                        {litSrc && (
                            <div className={canvasClassName}>
                                <OptimizedImage
                                    src={litSrc}
                                    alt={`${alt} Lit`}
                                    width={1920}
                                    height={1080}
                                    className={imageClassName}
                                    draggable={false}
                                />
                            </div>
                        )}
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 text-white font-mono text-xs tracking-widest pointer-events-none">
                            STATUS: LIT
                        </div>
                    </div>

                    {/* Unlit Image (Foreground, clipped) */}
                    <div
                        className="absolute inset-0"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <div className="absolute inset-0 bg-neutral-800" />
                        {unlitSrc && (
                            <div className={canvasClassName}>
                                <OptimizedImage
                                    src={unlitSrc}
                                    alt={`${alt} Unlit`}
                                    width={1920}
                                    height={1080}
                                    className={imageClassName}
                                    draggable={false}
                                />
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 text-white/70 font-mono text-xs tracking-widest pointer-events-none">
                            STATUS: UNLIT
                        </div>
                    </div>

                    {/* Slider line and button */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
                        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transition-shadow duration-150"
                            data-cursor-magnet="slider-handle"
                            data-cursor-magnet-size="32"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
