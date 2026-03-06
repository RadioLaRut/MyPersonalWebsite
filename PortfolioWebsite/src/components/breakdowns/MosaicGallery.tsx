"use client";

import React from "react";
import { OptimizedImage } from "@/components/common/OptimizedImage";

interface MosaicGalleryProps {
  images: {
    src: string;
    caption?: string;
  }[];
}

export default function MosaicGallery({ images }: MosaicGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col pt-0 pb-0 gap-y-1 bg-black relative z-10">
      {images.map((image, index) => (
        <div key={`${image.src}-${index}`} className="w-full h-screen relative bg-black">
          <OptimizedImage
            src={image.src}
            alt={image.caption || `Gallery ${index + 1}`}
            fill
            sizes="100vw"
            className="absolute inset-0 w-full h-full object-contain opacity-100 pointer-events-none"
          />
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
