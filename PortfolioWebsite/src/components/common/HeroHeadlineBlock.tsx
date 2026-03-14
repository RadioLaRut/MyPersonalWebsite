"use client";

import type { ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import { resolveEditableText, toPlainText } from "@/lib/editable-text";
import {
  type ImageFitMode,
  type ImagePreset,
} from "@/lib/image-presentation";
import { getGridColumnClassName } from "@/lib/component-design-style";

interface HeroHeadlineBlockProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  heroImage?: string;
  heroImagePreset?: ImagePreset;
  heroImageFitMode?: ImageFitMode;
  navLink?: string;
  editMode?: boolean;
}

export default function HeroHeadlineBlock({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroImagePreset,
  heroImageFitMode,
  navLink,
  editMode = false,
}: HeroHeadlineBlockProps) {
  const design = useComponentDesign("HeroHeadline");
  const resolvedEyebrow = resolveEditableText(eyebrow, "PROJECT");
  const resolvedTitle = resolveEditableText(title, "PROJECT TITLE");
  const resolvedSubtitle = resolveEditableText(
    subtitle,
    "Add a short project summary.",
  );
  const resolvedHeroImage = typeof heroImage === "string" ? heroImage.trim() : "";
  const heroImageAlt = toPlainText(title) ?? "PROJECT TITLE";
  const contentBoundsClassName = getGridColumnClassName(design.contentBounds);

  if (editMode) {
    return (
      <section className="relative isolate w-full min-h-[560px] overflow-hidden border-y border-white/5 bg-black">
        <div className="absolute inset-0">
          <PresetImage
            src={resolvedHeroImage}
            alt={heroImageAlt}
            preset={heroImagePreset}
            fitMode={heroImageFitMode}
            sizes="100vw"
            priority
            lockFrame={false}
            frameClassName="h-full w-full opacity-65"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.68)_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-[560px] items-end py-16 md:py-20">
          <div className="grid-container w-full">
            <div
              className={`${contentBoundsClassName} flex flex-col items-start gap-4 lg:gap-6`}
            >
              <Typography
                as="p"
                preset="sans-body"
                size="caption"
                weight="medium"
                wrapPolicy="label"
                className="text-textMuted"
              >
                {resolvedEyebrow}
              </Typography>
              <Typography
                as="h1"
                preset="sans-body"
                size="hero"
                weight="display"
                wrapPolicy="heading"
                className="text-white"
              >
                {resolvedTitle}
              </Typography>
              <Typography
                as="p"
                preset="sans-body"
                size="body"
                weight="medium"
                wrapPolicy="prose"
                className="max-w-3xl text-textPrimary"
              >
                {resolvedSubtitle}
              </Typography>
              {navLink ? (
                <div className="mt-4 border border-white/20 px-6 py-3">
                  <Typography
                    as="span"
                    preset="sans-body"
                    size="caption"
                    weight="medium"
                    wrapPolicy="label"
                    className="text-textPrimary"
                  >
                    播放演示视频 (Bilibili)
                  </Typography>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <header className="relative flex h-[85vh] w-full items-center justify-center overflow-hidden bg-black">
      {resolvedHeroImage ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <PresetImage
            src={resolvedHeroImage}
            alt={heroImageAlt}
            preset={heroImagePreset}
            fitMode={heroImageFitMode}
            sizes="100vw"
            priority
            frameClassName="w-full opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,1)_140%)]" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end pb-24 md:pb-32">
        <div className="grid-container w-full mix-blend-difference pointer-events-auto">
          <div
            className={`${contentBoundsClassName} flex flex-col items-start gap-4`}
          >
            {resolvedEyebrow ? (
              <Typography
                as="p"
                preset="sans-body"
                size="caption"
                weight="medium"
                wrapPolicy="label"
                className="text-textMuted sm:text-xs"
              >
                {resolvedEyebrow}
              </Typography>
            ) : null}
            {resolvedTitle ? (
              <Typography
                as="h1"
                preset="sans-body"
                size="hero"
                weight="display"
                wrapPolicy="heading"
                className="text-white"
              >
                {resolvedTitle}
              </Typography>
            ) : null}
            {resolvedSubtitle ? (
              <Typography
                as="p"
                preset="sans-body"
                size="body"
                weight="medium"
                wrapPolicy="prose"
                className="max-w-3xl text-textPrimary"
              >
                {resolvedSubtitle}
              </Typography>
            ) : null}
            {navLink ? (
              <a
                href={navLink}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive mt-8 border border-white/30 px-6 py-3 transition-colors hover:bg-white hover:text-black mix-blend-normal"
              >
                <Typography
                  as="span"
                  preset="sans-body"
                  size="caption"
                  weight="medium"
                  wrapPolicy="label"
                  className="text-current"
                >
                  播放演示视频 (Bilibili)
                </Typography>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
