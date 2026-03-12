"use client";

import { type ReactNode } from "react";
import Link from "next/link";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export interface LightingProjectCardProps {
  number: string;
  title: ReactNode;
  coverImage: string;
  href?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  editMode?: boolean;
}

function hasNodeContent(value: ReactNode) {
  if (value === null || value === undefined || value === false) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

function getNodeAltText(value: ReactNode) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
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
  const hasTitle = hasNodeContent(title);
  const imageAlt = getNodeAltText(title) ?? `Lighting collection ${number}`;

  const content = (
    <article className="group glass-panel relative h-full w-full overflow-hidden rounded-none">
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_35%,rgba(0,0,0,0.82)_100%)] transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute inset-0 z-0">
        <PresetImage
          src={coverImage}
          alt={imageAlt}
          preset={imagePreset}
          fitMode={imageFitMode}
          lockFrame={false}
          frameClassName="h-full w-full"
          imageClassName="transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>

      <div className="relative z-20 min-h-[22rem] md:min-h-[30rem]">
        <div className="absolute left-0 top-0 px-5 py-5 md:px-6 md:py-6">
          <Typography
            preset="sans-body"
            size="caption"
            weight="semantic"
            wrapPolicy="label"
            className="text-white/48"
            style={{ lineHeight: 1 }}
          >
            Collection {number}
          </Typography>
        </div>
        <div className="absolute right-0 top-0 py-5 pr-[0.55rem] md:py-6 md:pr-[0.7rem]">
          <Typography
            preset="sans-body"
            size="caption"
            weight="semantic"
            wrapPolicy="label"
            className="text-right text-white/40 transition-colors duration-300 group-hover:text-white/72"
            style={{ lineHeight: 1 }}
          >
            Enter
          </Typography>
        </div>

        {hasTitle ? (
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 md:px-6 md:pb-6">
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
        ) : null}
      </div>
    </article>
  );

  return (
    <section className="w-full py-6 md:py-8">
      <div className="grid-container">
        {href ? (
          <Link
            href={href}
            onClick={(event) => {
              if (editMode) {
                event.preventDefault();
              }
            }}
            className="interactive col-start-2 col-end-12 block w-full"
          >
            {content}
          </Link>
        ) : (
          <div className="col-start-2 col-end-12 w-full">
            {content}
          </div>
        )}
      </div>
    </section>
  );
}
