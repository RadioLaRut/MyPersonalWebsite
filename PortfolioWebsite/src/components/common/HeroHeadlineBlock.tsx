import type { ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { resolveEditableText, toPlainText } from "@/lib/editable-text";
import {
  type ImageFitMode,
  type ImagePreset,
} from "@/lib/image-presentation";
import { getGridColumnClassName } from "@/lib/component-design-style";

type HeroHeadlineBlockProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  subtitleAlign?: TypographyAlignment;
  heroImage?: string;
  heroImagePreset?: ImagePreset;
  heroImageFitMode?: ImageFitMode;
  navLink?: string;
  navLinkLabel?: ReactNode;
  editMode?: boolean;
} & ComponentDesignOverride<"HeroHeadline">;

export default function HeroHeadlineBlock({
  eyebrow,
  title,
  subtitle,
  subtitleAlign = "left",
  heroImage,
  heroImagePreset,
  heroImageFitMode,
  navLink,
  navLinkLabel = "观看视频",
  editMode = false,
  design,
}: HeroHeadlineBlockProps) {
  const resolvedDesign = resolveComponentDesign("HeroHeadline", design);
  const resolvedEyebrow = resolveEditableText(eyebrow, "PROJECT");
  const resolvedTitle = resolveEditableText(title, "PROJECT TITLE");
  const resolvedSubtitle = resolveEditableText(
    subtitle,
    "Add a short project summary.",
  );
  const resolvedHeroImage = typeof heroImage === "string" ? heroImage.trim() : "";
  const heroImageAlt = toPlainText(title) ?? "PROJECT TITLE";
  const contentBoundsClassName = getGridColumnClassName(resolvedDesign.contentBounds);

  return (
    <header className="relative flex min-h-[calc(var(--site-viewport-unit)*85)] w-full items-center justify-center overflow-hidden bg-black">
      {resolvedHeroImage ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <PresetImage
            src={resolvedHeroImage}
            alt={heroImageAlt}
            preset={heroImagePreset}
            fitMode={heroImageFitMode}
            fitModeByBreakpoint={{ base: "cover", lg: heroImageFitMode ?? "x" }}
            sizes="100vw"
            priority
            lockFrame={false}
            frameClassName="h-full w-full opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,1)_140%)]" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end pb-24 md:pb-32">
        <div className="grid-container w-full mix-blend-difference pointer-events-auto">
          <div
            className={`${contentBoundsClassName} flex flex-col items-start`}
          >
            {resolvedEyebrow ? (
              <Typography
                as="p"
                preset="sans-body"
                size="label"
                weight="semantic"
                wrapPolicy="label"
                className="mb-4 text-white/50 tracking-[0.1em] uppercase"
              >
                {resolvedEyebrow}
              </Typography>
            ) : null}
            {resolvedTitle ? (
              <Typography
                as="h1"
                preset="luna-editorial"
                size="hero"
                weight="semantic"
                wrapPolicy="heading"
                className="text-white uppercase leading-[0.9]"
              >
                {resolvedTitle}
              </Typography>
            ) : null}
            {resolvedSubtitle ? (
              <div className="mt-6 md:mt-8">
                <Typography
                  as="p"
                  preset="sans-body"
                  size="title-sm"
                  weight="medium"
                  wrapPolicy="prose"
                  align={subtitleAlign}
                  className="max-w-3xl text-white/90"
                >
                  {resolvedSubtitle}
                </Typography>
              </div>
            ) : null}
            {navLink ? (
              <a
                href={editMode ? undefined : navLink}
                target={editMode ? undefined : "_blank"}
                rel={editMode ? undefined : "noopener noreferrer"}
                aria-disabled={editMode || undefined}
                className={`${editMode ? "cursor-default" : "interactive hover:bg-white hover:text-black"} mt-10 md:mt-12 inline-grid place-items-center border border-white/20 bg-white/5 px-8 py-3.5 transition-colors mix-blend-normal backdrop-blur-sm`}
              >
                <Typography
                  as="span"
                  preset="sans-body"
                  size="label"
                  weight="semantic"
                  wrapPolicy="label"
                  align="center"
                  className="text-current tracking-widest uppercase"
                >
                  {navLinkLabel}
                </Typography>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
