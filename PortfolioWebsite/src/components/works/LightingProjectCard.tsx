import { type ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { MotionLink } from "@/components/motion/MotionLink";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export type LightingProjectCardProps = {
  number: ReactNode;
  title: ReactNode;
  coverImage?: string;
  href?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  editMode?: boolean;
} & ComponentDesignOverride<"LightingProjectCard">;

export default function LightingProjectCard({
  number,
  title,
  coverImage,
  href,
  imagePreset = "ratio-21-9",
  imageFitMode = "cover",
  editMode = false,
  design,
}: LightingProjectCardProps) {
  const resolvedDesign = resolveComponentDesign("LightingProjectCard", design);
  const hasTitle = hasEditableTextContent(title);
  const imageAlt = toPlainText(title) ?? `Lighting collection ${toPlainText(number) ?? ""}`;

  const content = (
    <article className="group glass-panel relative h-full w-full overflow-hidden rounded-none">
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_35%,rgba(0,0,0,0.82)_100%)] opacity-95 transition-opacity duration-700 group-hover:opacity-[0.88] group-focus-visible:opacity-[0.88]" />
      {coverImage ? (
        <div className="absolute inset-0 z-0">
          <PresetImage
            src={coverImage}
            alt={imageAlt}
            preset={imagePreset === "native" ? "ratio-16-9" : imagePreset}
            fitMode={imageFitMode}
            lockFrame={false}
            frameClassName="h-full w-full"
            imageClassName="transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.018] group-hover:contrast-[1.04] group-focus-visible:scale-[1.018] group-focus-visible:contrast-[1.04]"
          />
        </div>
      ) : null}

      <div className="relative z-20 aspect-video md:aspect-[21/9]">
        <div className="absolute left-0 top-0 px-5 py-5 md:px-6 md:py-6">
          <Typography
            preset="sans-body"
            size="caption"
            weight="semantic"
            wrapPolicy="label"
            className="text-white/48"
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
            className="text-right text-white/[0.42] transition-colors duration-500 group-hover:text-white/[0.66] group-focus-visible:text-white/[0.66]"
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
    <section className="w-full py-4 md:py-6 lg:py-8">
      <div className="grid-container">
        {href ? (
          <MotionLink
            href={href}
            disabled={editMode}
            interactionPreset="blockLink"
            className={`${getResponsiveGridColumnClassName(createResponsiveGridBounds(
              { leftCol: 1, rightCol: 12 },
              { leftCol: 2, rightCol: 11 },
              resolvedDesign.contentBounds,
            ))} block w-full ${editMode ? "cursor-default" : "interactive"}`}
          >
            {content}
          </MotionLink>
        ) : (
          <div className={`${getResponsiveGridColumnClassName(createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            { leftCol: 2, rightCol: 11 },
            resolvedDesign.contentBounds,
          ))} w-full`}>
            {content}
          </div>
        )}
      </div>
    </section>
  );
}
