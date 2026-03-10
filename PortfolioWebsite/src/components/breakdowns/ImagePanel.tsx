"use client";

import React from "react";
import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export interface ImagePanelProps {
  src: string;
  alt?: string;
  caption?: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
  variant?: "content" | "fullscreen";
}

export default function ImagePanel({
  src,
  alt,
  caption,
  preset,
  fitMode,
  variant = "content",
}: ImagePanelProps) {
  if (!src) {
    return null;
  }

  const imageAlt = alt || caption || "Image";

  if (variant === "fullscreen") {
    return (
      <div className="relative h-full min-h-screen min-h-[100dvh] w-full bg-black">
        <div className="flex h-full w-full items-center justify-center">
          <PresetImage
            src={src}
            alt={imageAlt}
            preset={preset}
            fitMode={fitMode}
            sizes="100vw"
            frameClassName="w-full pointer-events-none"
          />
        </div>
        {caption ? (
          <div className="absolute bottom-8 right-8 bg-black/65 border border-white/15 px-4 py-2">
            <span className="font-futura text-xs tracking-[0.2em] uppercase text-textPrimary">{caption}</span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8">
      <figure className="overflow-hidden border border-white/15 bg-white/[0.03]">
        <PresetImage alt={imageAlt} src={src} preset={preset} fitMode={fitMode} />
        {caption ? (
          <figcaption className="border-t border-white/15 px-4 py-3 text-xs uppercase tracking-[0.18em] text-textPrimary">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}
