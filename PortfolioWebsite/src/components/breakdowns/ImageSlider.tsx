"use client";

import { ChevronLeft, ChevronRight } from "lucide-react/dist/cjs/lucide-react.js";
import { useEffect, useId, useRef, useState } from "react";

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
import {
  type DragPoint,
  type GestureAxis,
  calculateHorizontalPercent,
  calculateSliderKeyboardPercent,
  classifyDirectionalIntent,
  clampPercent,
} from "@/lib/motion";

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
  initialPosition?: number;
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
  initialPosition = 50,
  editMode = false,
}: ImageSliderProps) {
  const design = useComponentDesign("ImageSlider");
  const [sliderPosition, setSliderPosition] = useState(() => clampPercent(initialPosition));
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const startPointRef = useRef<DragPoint | null>(null);
  const intentRef = useRef<GestureAxis>("undecided");
  const resolvedPreset = normalizeImagePreset(imagePreset);
  const resolvedFitMode = normalizeImageFitMode(imageFitMode);
  const frameClassName = getImagePresetFrameClassName(resolvedPreset);
  const canvasClassName = getImageCanvasClassName(resolvedPreset);
  const imageClassName = getImageElementClassName(resolvedPreset, resolvedFitMode);
  const visibleTitle = typeof title === "string" && title.trim().length > 0 ? title : alt;
  const sliderDescriptionId = useId();

  useEffect(() => {
    setSliderPosition(clampPercent(initialPosition));
  }, [initialPosition]);

  const updatePosition = (clientX: number) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    setSliderPosition(calculateHorizontalPercent(clientX, rect));
  };

  const resetDrag = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && activePointerIdRef.current === event.pointerId) {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }
    }

    activePointerIdRef.current = null;
    startPointRef.current = null;
    intentRef.current = "undecided";
    setIsDragging(false);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (editMode || event.button !== 0) {
      return;
    }

    activePointerIdRef.current = event.pointerId;
    startPointRef.current = { clientX: event.clientX, clientY: event.clientY };
    intentRef.current = event.pointerType === "touch" ? "undecided" : "horizontal";
    event.currentTarget.setPointerCapture?.(event.pointerId);

    if (event.pointerType !== "touch") {
      setIsDragging(true);
      updatePosition(event.clientX);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (editMode || activePointerIdRef.current !== event.pointerId || !startPointRef.current) {
      return;
    }

    if (intentRef.current === "undecided") {
      intentRef.current = classifyDirectionalIntent(startPointRef.current, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    }

    if (intentRef.current === "vertical") {
      resetDrag(event);
      return;
    }

    if (intentRef.current !== "horizontal") {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    setIsDragging(true);
    updatePosition(event.clientX);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (editMode) {
      return;
    }

    const nextPosition = calculateSliderKeyboardPercent(sliderPosition, event.key);
    if (nextPosition === null) {
      return;
    }

    event.preventDefault();
    setSliderPosition(nextPosition);
  };

  const cursorClass = editMode
    ? "cursor-default"
    : isDragging
      ? "cursor-grabbing"
      : "cursor-ew-resize";

  return (
    <div className={`w-full ${getSectionSpacingClassName(design.sectionSpacing)} ${className}`}>
      <div className="grid-container">
        <div className={getGridColumnClassName(design.contentBounds)}>
          <div
            ref={containerRef}
            className={`${frameClassName} group select-none touch-pan-y focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 ${cursorClass}`}
            data-dragging={isDragging ? "true" : undefined}
            role="slider"
            tabIndex={editMode ? -1 : 0}
            aria-label={`${visibleTitle} 图片对比`}
            aria-describedby={sliderDescriptionId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderPosition)}
            aria-valuetext={`${leftLabel ?? "左侧图像"} ${Math.round(sliderPosition)}%，${rightLabel ?? "右侧图像"} ${Math.round(100 - sliderPosition)}%`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={resetDrag}
            onPointerCancel={resetDrag}
            onLostPointerCapture={resetDrag}
            onKeyDown={handleKeyDown}
          >
            <span id={sliderDescriptionId} className="sr-only">
              使用左右或上下方向键微调，Page Up 和 Page Down 大幅调整，Home 和 End 跳到两端。
            </span>
            {visibleTitle ? (
              <div className="pointer-events-none absolute left-5 top-5 z-20 md:left-6 md:top-6">
                <div className="border border-white/12 bg-black/58 px-3 py-2 backdrop-blur-sm">
                  <Typography
                    as="span"
                    preset="sans-body"
                    size="label"
                    weight="semantic"
                    wrapPolicy="label"
                    className="text-white/88"
                  >
                    {visibleTitle}
                  </Typography>
                </div>
              </div>
            ) : null}

            <div className={resolvedPreset === "native" ? "relative w-full" : "absolute inset-0"}>
              <div className="absolute inset-0 bg-neutral-900" />
              {litSrc ? (
                <div className={`${canvasClassName} relative z-10`}>
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
                <div className={`${canvasClassName} relative z-10`}>
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
              className={`pointer-events-none absolute bottom-0 top-0 z-20 w-px transition-[background-color,width] duration-300 ease-out ${isDragging ? "bg-white" : "bg-white/[0.74] group-hover:bg-white/[0.88]"}`}
              style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={`absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 grid-cols-2 place-items-center rounded-full bg-white/[0.92] text-black shadow-[0_0_0_1px_rgba(255,255,255,0.28),0_10px_30px_rgba(0,0,0,0.36)] transition-[background-color,box-shadow,transform] duration-300 ease-out group-hover:scale-[1.04] group-hover:bg-white ${isDragging ? "scale-[1.06] bg-white shadow-[0_0_18px_rgba(255,255,255,0.32)]" : ""}`}
                data-cursor-magnet="slider-handle"
                data-cursor-magnet-size="32"
                aria-hidden="true"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            </div>
          </div>

          {leftLabel || rightLabel ? (
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
              ) : (
                <span />
              )}
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
