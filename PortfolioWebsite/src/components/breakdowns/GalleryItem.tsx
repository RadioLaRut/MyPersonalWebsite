"use client";

import React from "react";
import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export interface GalleryItemProps {
  src: string;
  caption?: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
}

export default function GalleryItem({
  src,
  caption,
  preset,
  fitMode,
}: GalleryItemProps) {
  if (!src) {
    return null;
  }

  return (
    <div className="relative h-screen w-full bg-black">
      <div className="flex h-full w-full items-center justify-center">
        <PresetImage
          src={src}
          alt={caption || "Gallery Image"}
          preset={preset}
          fitMode={fitMode}
          sizes="100vw"
          frameClassName="w-full pointer-events-none"
        />
      </div>
      {caption ? (
        <div className="absolute bottom-8 right-8 bg-black/65 border border-white/15 px-4 py-2">
          <span className="font-futura text-xs tracking-[0.2em] uppercase text-white/80">{caption}</span>
        </div>
      ) : null}
    </div>
  );
}
