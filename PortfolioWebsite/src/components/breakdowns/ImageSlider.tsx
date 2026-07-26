"use client";

import { type ReactNode, useId, useRef, useState } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  getGridColumnClassName,
  getSectionSpacingClassName,
  getSpacingRem,
  getComponentSectionProfileClassName,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";
import {
  type ImageFitMode,
  type ImagePreset,
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
} from "@/lib/motion/drag";
import type { PublicMediaHint } from "@/lib/media-layout";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

interface ImageSliderProps extends ComponentDesignOverride<"ImageSlider">, ComponentLayoutProps {
  title?: ReactNode;
  unlitSrc: string;
  litSrc: string;
  alt?: string;
  className?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  leftLabel?: ReactNode;
  rightLabel?: ReactNode;
  initialPosition?: number;
  editMode?: boolean;
  publicMediaHint?: PublicMediaHint;
}

export default function ImageSlider({
  componentLayout,
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
  publicMediaHint,
  design: designOverride,
}: ImageSliderProps) {
  const design = resolveComponentDesign("ImageSlider", designOverride);
  const normalizedInitialPosition = clampPercent(initialPosition);
  const [sliderState, setSliderState] = useState(() => ({
    initialPosition: normalizedInitialPosition,
    position: normalizedInitialPosition,
  }));
  const sliderPosition = sliderState.initialPosition === normalizedInitialPosition
    ? sliderState.position
    : normalizedInitialPosition;
  const setSliderPosition = (position: number) => {
    setSliderState({ initialPosition: normalizedInitialPosition, position });
  };
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const startPointRef = useRef<DragPoint | null>(null);
  const intentRef = useRef<GestureAxis>("undecided");
  const resolvedPreset = normalizeImagePreset(imagePreset);
  const resolvedFitMode = normalizeImageFitMode(imageFitMode);
  const frameClassName = getImagePresetFrameClassName(resolvedPreset);
  const preservesNativeHeight = resolvedPreset === "native";
  const imageFrameClassName = preservesNativeHeight ? "w-full" : "h-full w-full";
  const visibleTitle = hasEditableTextContent(title) ? title : alt;
  const visibleTitleText = toPlainText(visibleTitle) ?? alt;
  const leftLabelText = toPlainText(leftLabel);
  const rightLabelText = toPlainText(rightLabel);
  const sliderDescriptionId = useId();
  const titleTypography = getComponentLayoutTypography(componentLayout, "title");
  const leftLabelTypography = getComponentLayoutTypography(componentLayout, "leftLabel");
  const rightLabelTypography = getComponentLayoutTypography(componentLayout, "rightLabel");

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
    <div className={`w-full ${
      componentLayout
        ? getComponentSectionProfileClassName(componentLayout)
        : getSectionSpacingClassName(design.sectionSpacing)
    } ${className}`}>
      <div className="grid-container">
        <ComponentLayoutNode
          layout={componentLayout}
          nodeId="media"
          className={componentLayout ? undefined : getGridColumnClassName(design.contentBounds)}
        >
          <div
            ref={containerRef}
            className={`${frameClassName} group select-none touch-pan-y focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 ${cursorClass}`}
            data-dragging={isDragging ? "true" : undefined}
            role="slider"
            tabIndex={editMode ? -1 : 0}
            aria-label={`${visibleTitleText} 图片对比`}
            aria-describedby={sliderDescriptionId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderPosition)}
            aria-valuetext={`${leftLabelText ?? "左侧图像"} ${Math.round(sliderPosition)}%，${rightLabelText ?? "右侧图像"} ${Math.round(100 - sliderPosition)}%`}
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
            {visibleTitle && !componentLayout ? (
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

            <div
              data-image-slider-layer="lit"
              className={`${resolvedPreset === "native" ? "relative w-full" : "absolute inset-0"} z-0`}
            >
              <div className="absolute inset-0 bg-neutral-900" />
              {litSrc ? (
                <div className="relative z-10 h-full w-full">
                  <PresetImage
                    src={litSrc}
                    alt={rightLabelText ? `${alt} ${rightLabelText}` : alt}
                    preset={resolvedPreset}
                    fitMode={resolvedFitMode}
                    preload={publicMediaHint?.src === litSrc && publicMediaHint.preload}
                    mediaProfile="grid-10"
                    sizes={publicMediaHint?.src === litSrc ? publicMediaHint.sizes : undefined}
                    lockFrame={preservesNativeHeight}
                    frameClassName={imageFrameClassName}
                    imageClassName="select-none"
                    draggable={false}
                  />
                </div>
              ) : null}
            </div>

            <div
              data-image-slider-layer="unlit"
              className="absolute inset-0 z-10"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <div className="absolute inset-0 bg-neutral-800" />
              {unlitSrc ? (
                <div className="relative z-10 h-full w-full">
                  <PresetImage
                    src={unlitSrc}
                    alt={leftLabelText ? `${alt} ${leftLabelText}` : alt}
                    preset={resolvedPreset}
                    fitMode={resolvedFitMode}
                    preload={publicMediaHint?.src === unlitSrc && publicMediaHint.preload}
                    mediaProfile="grid-10"
                    sizes={publicMediaHint?.src === unlitSrc ? publicMediaHint.sizes : undefined}
                    lockFrame={preservesNativeHeight}
                    frameClassName={imageFrameClassName}
                    imageClassName="select-none"
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
                <ChevronIcon direction="left" />
                <ChevronIcon direction="right" />
              </div>
            </div>
          </div>

          {!componentLayout &&
          (hasEditableTextContent(leftLabel) || hasEditableTextContent(rightLabel)) ? (
            <div
              className="flex items-start justify-between gap-6"
              style={{ marginTop: getSpacingRem(design.labelsTopSpacing) }}
            >
              {hasEditableTextContent(leftLabel) ? (
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
              {hasEditableTextContent(rightLabel) ? (
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
        </ComponentLayoutNode>
        {componentLayout && visibleTitle ? (
          <ComponentLayoutNode layout={componentLayout} nodeId="title">
            <Typography
              as="span"
              preset={titleTypography?.preset ?? "sans-body"}
              size={titleTypography?.size ?? "title-sm"}
              weight="semantic"
              wrapPolicy={titleTypography?.wrap ?? "heading"}
              align={getComponentLayoutAlignment(componentLayout, "title")}
              className="text-white/88"
            >
              {visibleTitle}
            </Typography>
          </ComponentLayoutNode>
        ) : null}
        {componentLayout && hasEditableTextContent(leftLabel) ? (
          <ComponentLayoutNode
            gapFrom="media"
            layout={componentLayout}
            nodeId="leftLabel"
          >
            <Typography
              as="span"
              preset={leftLabelTypography?.preset ?? "sans-body"}
              size={leftLabelTypography?.size ?? "caption"}
              weight="semantic"
              wrapPolicy={leftLabelTypography?.wrap ?? "label"}
              align={getComponentLayoutAlignment(componentLayout, "leftLabel")}
              className="text-white/82"
            >
              {leftLabel}
            </Typography>
          </ComponentLayoutNode>
        ) : null}
        {componentLayout && hasEditableTextContent(rightLabel) ? (
          <ComponentLayoutNode
            gapFrom="media"
            layout={componentLayout}
            nodeId="rightLabel"
          >
            <Typography
              as="span"
              preset={rightLabelTypography?.preset ?? "sans-body"}
              size={rightLabelTypography?.size ?? "caption"}
              weight="semantic"
              wrapPolicy={rightLabelTypography?.wrap ?? "label"}
              align={getComponentLayoutAlignment(componentLayout, "rightLabel", "right")}
              className="text-white/82"
            >
              {rightLabel}
            </Typography>
          </ComponentLayoutNode>
        ) : null}
      </div>
    </div>
  );
}
