"use client";

import React from "react";
import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

interface MosaicGalleryProps {
  images: {
    src: string;
    caption?: string;
    preset?: ImagePreset;
    fitMode?: ImageFitMode;
  }[];
}

export default function MosaicGallery({ images }: MosaicGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col pt-0 pb-0 gap-y-1 bg-black relative z-10">
      {images.map((image, index) => (
        <div key={`${image.src}-${index}`} className="relative h-screen w-full bg-black">
          <div className="flex h-full w-full items-center justify-center">
            <PresetImage
              src={image.src}
              alt={image.caption || `Gallery ${index + 1}`}
              preset={image.preset}
              fitMode={image.fitMode}
              sizes="100vw"
              frameClassName="w-full pointer-events-none"
            />
          </div>
          {image.caption ? (
            <div className="absolute bottom-8 right-8 bg-black/65 border border-white/15 px-4 py-2">
              <span className="font-futura text-xs tracking-[0.2em] uppercase text-white/80">{image.caption}</span>
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
