"use client";

import clsx from "clsx";
import Image from "next/image";

import {
  type ImageFitMode,
  type ImagePreset,
  getImageCanvasClassName,
  getImageElementClassName,
  getImagePresetFrameClassName,
  normalizeImageFitMode,
  normalizeImagePreset,
} from "@/lib/image-presentation";
import { normalizeImageSrc } from "@/lib/public-paths";

type PresetImageProps = {
  src: string;
  alt: string;
  preset?: ImagePreset | string;
  fitMode?: ImageFitMode | string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
  draggable?: boolean;
  lockFrame?: boolean;
  frameClassName?: string;
  canvasClassName?: string;
  imageClassName?: string;
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
    getImageElementClassName(resolvedPreset, resolvedFitMode),
    imageClassName,
  );
  const shouldUseImgFallback = resolvedPreset === "native" || isRemoteSrc;

  return (
    <div className={clsx(frameClasses, frameClassName)}>
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
              src={normalizedSrc}
              alt={alt}
              loading={loading ?? (priority ? "eager" : "lazy")}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              sizes={sizes}
              draggable={draggable}
              className={imageClasses}
            />
          </>
        ) : (
          <Image
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
          />
        )}
      </div>
    </div>
  );
}
