"use client";

import React from "react";
import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export interface ImagePanelProps {
  src: string;
  alt?: string;
  caption?: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
  variant?: "content" | "large" | "fullscreen";
}

export default function ImagePanel({
  src,
  alt,
  caption,
  preset,
  fitMode,
  variant = "content",
}: ImagePanelProps) {
  if (!src) return null;

  const imageAlt = alt || caption || "Image";

  if (variant === "fullscreen") {
    return (
      <div className="relative h-full min-h-screen min-h-[100dvh] w-full bg-black">
        <div className="grid h-full w-full place-items-center">
          <PresetImage
            src={src}
            alt={imageAlt}
            preset={preset}
            fitMode={fitMode}
            priority
            sizes="100vw"
            frameClassName="w-full pointer-events-none"
          />
        </div>
        {caption ? (
          <div className="absolute bottom-8 right-8 bg-black/65 border border-white/15 px-4 py-2">
            <Typography preset="sans-body" size="label" weight="semantic" wrapPolicy="label" className="text-textPrimary">
              {caption}
            </Typography>
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "large") {
    return (
      <section className="w-full rhythm-block-compact">
        <div className="grid-container">
          <figure className="col-start-2 col-span-10 overflow-hidden rounded-none border border-white/10 bg-white/[0.02]">
            <PresetImage
              alt={imageAlt}
              src={src}
              preset={preset}
              fitMode={fitMode}
              priority
              sizes="(min-width: 1024px) 84vw, 92vw"
              frameClassName="w-full"
              imageClassName="select-none"
            />
            {caption ? (
              <figcaption className="border-t border-white/10 px-5 py-4 md:px-6">
                <Typography preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="text-textPrimary">
                  {caption}
                </Typography>
              </figcaption>
            ) : null}
          </figure>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full rhythm-block-compact">
      <div className="grid-container">
        <figure className="grid-content mx-auto w-full max-w-5xl overflow-hidden border border-white/15 bg-white/[0.03]">
          <PresetImage alt={imageAlt} src={src} preset={preset} fitMode={fitMode} />
          {caption ? (
            <figcaption className="border-t border-white/15 px-4 py-3">
              <Typography preset="sans-body" size="label" weight="semantic" wrapPolicy="label" className="text-textPrimary">
                {caption}
              </Typography>
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  );
}
