"use client";

import { useEffect, useRef, useState } from "react";

import { OptimizedImage } from "@/components/common/OptimizedImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import {
  getGridColumnClassName,
  getSectionSpacingClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import {
  type ImageFitMode,
  type ImagePreset,
  getImageCanvasClassName,
  getImageElementClassName,
  getImagePresetFrameClassName,
  normalizeImageFitMode,
  normalizeImagePreset,
} from "@/lib/image-presentation";

interface ImageSliderProps {
  title?: string;
  unlitSrc: string;
  litSrc: string;
  alt?: string;
  className?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  leftLabel?: string;
  rightLabel?: string;
  editMode?: boolean;
}

export default function ImageSlider({
  title,
  unlitSrc,
  litSrc,
  alt = "Image Comparison",
  className = "",
  imagePreset = "ratio-16-9",
  imageFitMode = "x",
  leftLabel,
  rightLabel,
  editMode = false,
}: ImageSliderProps) {
  const design = useComponentDesign("ImageSlider");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedPreset = normalizeImagePreset(imagePreset);
  const resolvedFitMode = normalizeImageFitMode(imageFitMode);
  const frameClassName = getImagePresetFrameClassName(resolvedPreset);
  const canvasClassName = getImageCanvasClassName(resolvedPreset);
  const imageClassName = getImageElementClassName(resolvedPreset, resolvedFitMode);
  const visibleTitle = typeof title === "string" && title.trim().length > 0 ? title : alt;

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (editMode) {
      setIsDragging(false);
      return;
    }

    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [editMode]);

  const cursorClass = editMode ? "cursor-default" : "cursor-ew-resize";

  return (
    <div className={`w-full ${getSectionSpacingClassName(design.sectionSpacing)} ${className}`}>
      <div className="grid-container">
        <div className={getGridColumnClassName(design.contentBounds)}>
          <div
            ref={containerRef}
            className={`${frameClassName} select-none ${cursorClass}`}
            onMouseMove={editMode ? undefined : handleMouseMove}
            onTouchMove={editMode ? undefined : handleTouchMove}
            onMouseDown={editMode ? undefined : () => setIsDragging(true)}
            onTouchStart={editMode ? undefined : () => setIsDragging(true)}
          >
                        {visibleTitle ? (
                            <div className="pointer-events-none absolute left-5 top-5 z-20 md:left-6 md:top-6">
                                <div className="border border-white/12 bg-black/58 px-3 py-2 backdrop-blur-sm">
                                    <Typography
                                        as="span"
                                        preset="sans-body"
                                        size="label"
                                        weight="medium"
                                        wrapPolicy="label"
                                        className="text-white/88"
                                    >
                                        {visibleTitle}
                                    </Typography>
                                </div>
                            </div>
                        ) : null}

                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-neutral-900" />
                            {litSrc ? (
                                <div className={canvasClassName}>
                                    <OptimizedImage
                                        src={litSrc}
                                        alt={rightLabel ? `${alt} ${rightLabel}` : alt}
                                        width={1920}
                                        height={1080}
                                        className={`${imageClassName} select-none`}
                                        draggable={false}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div
                            className="absolute inset-0"
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                        >
                            <div className="absolute inset-0 bg-neutral-800" />
                            {unlitSrc ? (
                                <div className={canvasClassName}>
                                    <OptimizedImage
                                        src={unlitSrc}
                                        alt={leftLabel ? `${alt} ${leftLabel}` : alt}
                                        width={1920}
                                        height={1080}
                                        className={`${imageClassName} select-none`}
                                        draggable={false}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
                            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
                        >
                            <div
                                className="absolute top-1/2 left-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 grid-flow-col auto-cols-max place-items-center rounded-full bg-white shadow-lg transition-shadow duration-150"
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

                    {(leftLabel || rightLabel) ? (
                        <div
                            className="flex items-start justify-between gap-6"
                            style={{ marginTop: getSpacingRem(design.labelsTopSpacing) }}
                        >
                            {leftLabel ? (
                                <Typography
                                    as="span"
                                    preset="sans-body"
                                    size="body-sm"
                                    weight="medium"
                                    wrapPolicy="label"
                                    className="text-white/82"
                                >
                                    {leftLabel}
                                </Typography>
                            ) : <span />}
                            {rightLabel ? (
                                <Typography
                                    as="span"
                                    preset="sans-body"
                                    size="body-sm"
                                    weight="medium"
                                    wrapPolicy="label"
                                    className="text-right text-white/82"
                                >
                                    {rightLabel}
                                </Typography>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
