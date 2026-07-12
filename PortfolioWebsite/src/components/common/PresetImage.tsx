"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCallback, useState, type CSSProperties } from "react";

import {
  type ImageBreakpointValue,
  type ImageFitMode,
  type ImageObjectPosition,
  type ImagePreset,
  getImageCanvasClassName,
  getImageElementClassName,
  getImagePresetFrameClassName,
  getResponsiveImageElementClassName,
  normalizeImageFitMode,
  normalizeImagePreset,
} from "@/lib/image-presentation";
import { normalizeImageSrc } from "@/lib/public-paths";

type PresetImageProps = {
  src: string;
  alt: string;
  preset?: ImagePreset | string;
  fitMode?: ImageFitMode | string;
  fitModeByBreakpoint?: ImageBreakpointValue<ImageFitMode>;
  objectPositionByBreakpoint?: ImageBreakpointValue<ImageObjectPosition>;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
  draggable?: boolean;
  lockFrame?: boolean;
  frameClassName?: string;
  canvasClassName?: string;
  imageClassName?: string;
};

type ImageLoadStatus = "loading" | "loaded" | "error";

type ImageLoadState = {
  src: string;
  status: ImageLoadStatus;
};

function getPresetDimensions(preset: ImagePreset) {
  if (preset === "ratio-21-9") {
    return { width: 2100, height: 900 };
  }

  return { width: 1600, height: 900 };
}

export function PresetImage({
  src,
  alt,
  preset = "ratio-16-9",
  fitMode = "x",
  fitModeByBreakpoint,
  objectPositionByBreakpoint,
  priority = false,
  loading,
  sizes,
  draggable,
  lockFrame = true,
  frameClassName,
  canvasClassName,
  imageClassName,
}: PresetImageProps) {
  const resolvedPreset = normalizeImagePreset(preset);
  const resolvedFitMode = normalizeImageFitMode(fitMode);
  const normalizedSrc = normalizeImageSrc(src);
  const isRemoteSrc = /^https?:\/\//i.test(normalizedSrc);
  const isSvg = normalizedSrc.toLowerCase().endsWith(".svg");
  const imageProps = getPresetDimensions(resolvedPreset);
  const frameClasses = lockFrame
    ? getImagePresetFrameClassName(resolvedPreset)
    : "relative h-full w-full overflow-hidden bg-black";
  const resolvedLoading = priority ? undefined : loading;
  const resolvedSizes = sizes ?? "100vw";
  const imageClasses = clsx(
    fitModeByBreakpoint
      ? getResponsiveImageElementClassName(
          resolvedPreset,
          resolvedFitMode,
          fitModeByBreakpoint,
        )
      : getImageElementClassName(resolvedPreset, resolvedFitMode),
    objectPositionByBreakpoint && !fitModeByBreakpoint && "responsive-preset-image",
    imageClassName,
  );
  const normalizePosition = (position?: ImageObjectPosition) =>
    position
      ? `${Math.min(100, Math.max(0, position.x))}% ${Math.min(100, Math.max(0, position.y))}%`
      : undefined;
  const imageStyle = objectPositionByBreakpoint
    ? ({
        "--preset-image-position-base": normalizePosition(objectPositionByBreakpoint.base) ?? "50% 50%",
        "--preset-image-position-md": normalizePosition(objectPositionByBreakpoint.md),
        "--preset-image-position-lg": normalizePosition(objectPositionByBreakpoint.lg),
      } as CSSProperties)
    : undefined;
  const shouldUseImgFallback = resolvedPreset === "native" || isRemoteSrc;
  const [loadState, setLoadState] = useState<ImageLoadState>({
    src: normalizedSrc,
    status: "loading",
  });
  const currentLoadStatus = loadState.src === normalizedSrc
    ? loadState.status
    : "loading";
  const updateLoadStatus = useCallback((status: ImageLoadStatus) => {
    setLoadState((current) => {
      if (current.src === normalizedSrc && current.status === status) {
        return current;
      }

      return { src: normalizedSrc, status };
    });
  }, [normalizedSrc]);
  const handleImageRef = useCallback((element: HTMLImageElement | null) => {
    if (!element?.complete) {
      return;
    }

    updateLoadStatus(element.naturalWidth > 0 ? "loaded" : "error");
  }, [updateLoadStatus]);

  return (
    <div
      className={clsx("preset-image-frame", frameClasses, frameClassName)}
      data-image-state={currentLoadStatus}
    >
      <div
        className={clsx(
          getImageCanvasClassName(resolvedPreset, lockFrame),
          canvasClassName,
        )}
      >
        {shouldUseImgFallback ? (
          <>
            {/* native 预设与远程 URL 仍走 img 兜底，避免原始比例失真和 next/image 外链白名单报错 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={handleImageRef}
              src={normalizedSrc}
              alt={alt}
              loading={loading ?? (priority ? "eager" : "lazy")}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              sizes={sizes}
              draggable={draggable}
              className={imageClasses}
              style={imageStyle}
              onLoad={() => updateLoadStatus("loaded")}
              onError={() => updateLoadStatus("error")}
            />
          </>
        ) : (
          <Image
            ref={handleImageRef}
            src={normalizedSrc}
            alt={alt}
            width={imageProps.width}
            height={imageProps.height}
            priority={priority}
            loading={resolvedLoading}
            sizes={resolvedSizes}
            unoptimized={isSvg}
            draggable={draggable}
            className={imageClasses}
            style={imageStyle}
            onLoad={() => updateLoadStatus("loaded")}
            onError={() => updateLoadStatus("error")}
          />
        )}
      </div>
      <div className="image-loading-indicator" aria-hidden="true">
        <span className="image-loading-track">
          <span className="image-loading-progress" />
        </span>
      </div>
    </div>
  );
}
