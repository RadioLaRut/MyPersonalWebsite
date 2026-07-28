import { type ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { MotionLink } from "@/components/motion/MotionLink";
import {
  createResponsiveGridBounds,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getResponsiveGridColumnClassName,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";

export type LightingProjectCardProps = {
  number: ReactNode;
  prompt?: ReactNode;
  title: ReactNode;
  coverImage?: string;
  href?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  editMode?: boolean;
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"LightingProjectCard"> & ComponentLayoutProps;

export default function LightingProjectCard({
  number,
  prompt,
  title,
  coverImage,
  componentLayout,
  href,
  imagePreset = "ratio-21-9",
  imageFitMode = "cover",
  editMode = false,
  publicMediaHint,
  design,
}: LightingProjectCardProps) {
  const resolvedDesign = resolveComponentDesign("LightingProjectCard", design);
  const hasTitle = hasEditableTextContent(title);
  const resolvedPrompt = hasEditableTextContent(prompt) ? prompt : "Enter";
  const hasCollectionPrefix = /^collection(?:\s|$)/i.test(
    toPlainText(number)?.trim() ?? "",
  );
  const imageAlt = toPlainText(title) ?? `Lighting collection ${toPlainText(number) ?? ""}`;
  const numberTypography = getComponentLayoutTypography(
    componentLayout,
    "number",
  );
  const promptTypography = getComponentLayoutTypography(
    componentLayout,
    "prompt",
  );
  const titleTypography = getComponentLayoutTypography(
    componentLayout,
    "title",
  );

  const content = (
    <article className="group glass-panel relative h-full w-full overflow-hidden rounded-none">
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_35%,rgba(0,0,0,0.82)_100%)] opacity-95 transition-opacity duration-700 group-hover:opacity-[0.88] group-focus-visible:opacity-[0.88]" />
      {coverImage ? (
        <div className="absolute inset-0 z-0">
          <PresetImage
            src={coverImage}
            alt={imageAlt}
            preload={publicMediaHint?.src === coverImage && publicMediaHint.preload}
            mediaProfile="grid-10"
            sizes={publicMediaHint?.src === coverImage ? publicMediaHint.sizes : undefined}
            preset={imagePreset === "native" ? "ratio-16-9" : imagePreset}
            fitMode={imageFitMode}
            lockFrame={false}
            frameClassName="h-full w-full"
            imageClassName="transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.018] group-hover:contrast-[1.04] group-focus-visible:scale-[1.018] group-focus-visible:contrast-[1.04]"
          />
        </div>
      ) : null}

      <div className="relative z-20 aspect-video md:aspect-[21/9]">
        <div className="absolute inset-x-0 top-0 px-5 py-5 md:px-6 md:py-6">
          <div className="grid-subgrid">
            <ComponentLayoutNode
              className={!componentLayout ? "col-start-1 col-span-5" : undefined}
              layout={componentLayout}
              nodeId="number"
              style={{ position: "relative", top: "auto", translate: "none" }}
            >
              <Typography
                preset={numberTypography?.preset ?? "sans-body"}
                size={numberTypography?.size ?? "caption"}
                weight="semantic"
                wrapPolicy={numberTypography?.wrap ?? "label"}
                align={getComponentLayoutAlignment(
                  componentLayout,
                  "number",
                )}
                className="text-white/48"
              >
                {hasCollectionPrefix ? number : <>Collection {number}</>}
              </Typography>
            </ComponentLayoutNode>
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 px-5 py-5 md:px-6 md:py-6">
          <div className="grid-subgrid">
            <ComponentLayoutNode
              className={!componentLayout ? "col-start-8 col-span-5" : undefined}
              layout={componentLayout}
              nodeId="prompt"
              style={{ position: "relative", top: "auto", translate: "none" }}
            >
              <Typography
                preset={promptTypography?.preset ?? "sans-body"}
                size={promptTypography?.size ?? "caption"}
                weight="semantic"
                wrapPolicy={promptTypography?.wrap ?? "label"}
                align={getComponentLayoutAlignment(
                  componentLayout,
                  "prompt",
                  "right",
                )}
                className="text-right text-white/[0.42] transition-colors duration-500 group-hover:text-white/[0.66] group-focus-visible:text-white/[0.66]"
              >
                {resolvedPrompt}
              </Typography>
            </ComponentLayoutNode>
          </div>
        </div>

        {hasTitle ? (
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 md:px-6 md:pb-6">
            <div className="grid-subgrid">
              <ComponentLayoutNode
                className={!componentLayout ? "col-start-1 col-span-12" : undefined}
                layout={componentLayout}
                nodeId="title"
                style={{ position: "relative", top: "auto", translate: "none" }}
              >
                <Typography
                  as="h2"
                  preset={titleTypography?.preset ?? "luna-editorial"}
                  size={titleTypography?.size ?? "title"}
                  weight="display"
                  wrapPolicy={titleTypography?.wrap ?? "heading"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "title",
                  )}
                  className="text-white"
                >
                  {title}
                </Typography>
              </ComponentLayoutNode>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );

  return (
    <section
      className={`w-full ${
        componentLayout
          ? getComponentSectionProfileClassName(componentLayout)
          : "py-4 md:py-6 lg:py-8"
      }`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="grid-container">
        <ComponentLayoutNode
          className={!componentLayout
            ? getResponsiveGridColumnClassName(createResponsiveGridBounds(
              { leftCol: 1, rightCol: 12 },
              { leftCol: 2, rightCol: 11 },
              resolvedDesign.contentBounds,
            ))
            : undefined}
          layout={componentLayout}
          nodeId="media"
        >
        {href ? (
          <MotionLink
            href={href}
            disabled={editMode}
            interactionPreset="blockLink"
            className={`block w-full ${
              editMode ? "cursor-default" : "interactive"
            }`}
          >
            {content}
          </MotionLink>
        ) : (
          <div className="w-full">
            {content}
          </div>
        )}
        </ComponentLayoutNode>
      </div>
    </section>
  );
}
