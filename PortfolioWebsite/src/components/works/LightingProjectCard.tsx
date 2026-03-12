"use client";

import Link from "next/link";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export interface LightingProjectCardProps {
  number: string;
  title: string;
  coverImage: string;
  href?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  editMode?: boolean;
}

export default function LightingProjectCard({
  number,
  title,
  coverImage,
  href,
  imagePreset = "ratio-21-9",
  imageFitMode = "cover",
  editMode = false,
}: LightingProjectCardProps) {
  const content = (
    <article className="group glass-panel relative overflow-hidden rounded-sm">
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_35%,rgba(0,0,0,0.82)_100%)] transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute inset-0 z-0">
        <PresetImage
          src={coverImage}
          alt={title || `Lighting collection ${number}`}
          preset={imagePreset}
          fitMode={imageFitMode}
          lockFrame={false}
          frameClassName="h-full w-full"
          imageClassName="transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>

      <div className="relative z-20 grid min-h-[22rem] content-between p-6 md:min-h-[30rem] md:p-8">
        <div className="grid grid-cols-[1fr_auto] items-start gap-6">
          <Typography
            preset="sans-body"
            size="caption"
            weight="medium"
            wrapPolicy="label"
            className="text-white/48"
          >
            Collection {number}
          </Typography>
          <Typography
            preset="sans-body"
            size="caption"
            weight="medium"
            wrapPolicy="label"
            className="text-white/40 transition-colors duration-300 group-hover:text-white/72"
          >
            Enter
          </Typography>
        </div>

        <div className="max-w-2xl">
          <Typography
            as="h2"
            preset="luna-editorial"
            size="title"
            weight="display"
            wrapPolicy="heading"
            className="text-white"
          >
            {title}
          </Typography>
        </div>
      </div>
    </article>
  );

  return (
    <section className="w-full py-6 md:py-8">
      <div className="grid-container">
        <div className="col-start-2 col-span-10">
          {href ? (
            <Link
              href={href}
              onClick={(event) => {
                if (editMode) {
                  event.preventDefault();
                }
              }}
              className="interactive block"
            >
              {content}
            </Link>
          ) : (
            content
          )}
        </div>
      </div>
    </section>
  );
}
