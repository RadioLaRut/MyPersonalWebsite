"use client";
/* eslint-disable @next/next/no-img-element */

import clsx from "clsx";

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
  const frameClasses = lockFrame
    ? getImagePresetFrameClassName(resolvedPreset)
    : "relative h-full w-full overflow-hidden bg-black";

  return (
    <div className={clsx(frameClasses, frameClassName)}>
      <div
        className={clsx(
          getImageCanvasClassName(resolvedPreset, lockFrame),
          canvasClassName,
        )}
      >
        <img
          src={normalizedSrc}
          alt={alt}
          loading={loading ?? (priority ? "eager" : "lazy")}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          sizes={sizes}
          draggable={draggable}
          className={clsx(
            getImageElementClassName(resolvedPreset, resolvedFitMode),
            imageClassName,
          )}
        />
      </div>
    </div>
  );
}
