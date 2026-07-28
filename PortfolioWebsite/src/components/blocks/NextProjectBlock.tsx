import type { ReactNode } from "react";

import ComponentLayoutNode, {
  getComponentLabNodeAttributes,
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { MotionLink } from "@/components/motion/MotionLink";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getGridColumnClassName,
  getResponsiveGridColumnClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { hasEditableTextContent } from "@/lib/editable-text";
import type { PublicMediaHint } from "@/lib/media-layout";

type NextProjectBlockProps = {
  eyebrow?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  nextId: string;
  href?: string;
  nextBg?: string;
  nextName?: string;
  editMode?: boolean;
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"NextProjectBlock"> & ComponentLayoutProps;

export default function NextProjectBlock({
  componentLayout,
  eyebrow,
  footerLeft,
  footerRight,
  nextId,
  href = "/works",
  nextBg = "",
  nextName,
  editMode = false,
  publicMediaHint,
  design,
}: NextProjectBlockProps) {
  const resolvedDesign = resolveComponentDesign("NextProjectBlock", design);
  const destinationName = nextName?.trim() || nextId;
  const eyebrowTypography = getComponentLayoutTypography(
    componentLayout,
    "eyebrow",
  );
  const titleTypography = getComponentLayoutTypography(
    componentLayout,
    "title",
  );
  const footerLeftTypography = getComponentLayoutTypography(
    componentLayout,
    "footerLeft",
  );
  const footerRightTypography = getComponentLayoutTypography(
    componentLayout,
    "footerRight",
  );
  const mediaHeightClassName = [
    (componentLayout?.section?.mobile.height ?? "auto") === "auto"
      ? "h-[calc(var(--site-viewport-unit)*40)]"
      : "min-h-0",
    (componentLayout?.section?.tablet.height ?? "auto") === "auto"
      ? "md:h-[calc(var(--site-viewport-unit)*60)]"
      : "md:min-h-0",
    (componentLayout?.section?.desktop.height ?? "auto") === "auto"
      ? "lg:h-[calc(var(--site-viewport-unit)*60)]"
      : "lg:min-h-0",
  ].join(" ");
  const hasFooter = hasEditableTextContent(footerLeft) ||
    hasEditableTextContent(footerRight);

  return (
    <footer className="relative z-20 mt-0 border-t border-white/20">
      <MotionLink
        href={href}
        disabled={editMode}
        interactionPreset="blockLink"
        className={`group relative block w-full overflow-hidden bg-black ${mediaHeightClassName} ${
          editMode ? "cursor-default" : "interactive"
        }`}
      >
        <div
          className="absolute inset-0 grid place-items-center"
          {...getComponentLabNodeAttributes(componentLayout, "media")}
        >
          <PresetImage
            src={nextBg}
            alt={`${destinationName} 封面`}
            preset="ratio-21-9"
            fitMode="cover"
            preload={publicMediaHint?.src === nextBg && publicMediaHint.preload}
            mediaProfile="full-bleed"
            lockFrame={false}
            sizes={publicMediaHint?.src === nextBg
              ? publicMediaHint.sizes
              : "100vw"}
            frameClassName="h-full w-full"
            imageClassName="scale-100 opacity-40 transition-[filter,opacity,transform] duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-75 group-hover:contrast-[1.04] group-focus-visible:scale-[1.025] group-focus-visible:opacity-75 group-focus-visible:contrast-[1.04]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/[0.58] transition-colors duration-700 group-hover:bg-black/[0.38] group-focus-visible:bg-black/[0.38]" />
        <div
          className={`pointer-events-none absolute inset-0 z-20 ${
            getComponentSectionProfileClassName(componentLayout)
          }`}
          style={getComponentSectionStyle(componentLayout)}
        >
          <div className="grid-container h-full">
            <div
              className={`${
                componentLayout
                  ? "col-span-12 grid h-full content-center"
                  : `${getGridColumnClassName(resolvedDesign.overlayBounds)} grid h-full place-items-center text-center`
              } mix-blend-difference`}
            >
              {hasEditableTextContent(eyebrow) ? (
                <ComponentLayoutNode
                  layout={componentLayout}
                  nodeId="eyebrow"
                >
                  <Typography
                    preset={eyebrowTypography?.preset ?? "sans-body"}
                    size={eyebrowTypography?.size ?? "label"}
                    weight="semantic"
                    wrapPolicy={eyebrowTypography?.wrap ?? "label"}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      "eyebrow",
                      "center",
                    )}
                    className="text-textMuted opacity-70 transition-all duration-700 group-hover:opacity-95 group-focus-visible:opacity-95 [&_.typography-run]:transition-[letter-spacing] [&_.typography-run]:duration-700 [&_.typography-run]:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[&_.typography-run]:!tracking-[0.12em] group-focus-visible:[&_.typography-run]:!tracking-[0.12em]"
                  >
                    {eyebrow}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
              <ComponentLayoutNode
                gapFrom={hasEditableTextContent(eyebrow)
                  ? "eyebrow"
                  : undefined}
                layout={componentLayout}
                nodeId="title"
              >
                <Typography
                  as="h2"
                  preset={titleTypography?.preset ?? "sans-body"}
                  size={titleTypography?.size ?? "title"}
                  weight="display"
                  wrapPolicy={titleTypography?.wrap ?? "heading"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "title",
                    "center",
                  )}
                  className="text-white uppercase transition-all duration-700 [&_.typography-run]:transition-[letter-spacing] [&_.typography-run]:duration-700 [&_.typography-run]:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[&_.typography-run]:!tracking-[0.04em] group-focus-visible:[&_.typography-run]:!tracking-[0.04em]"
                >
                  {destinationName}
                </Typography>
              </ComponentLayoutNode>
            </div>
          </div>
        </div>
      </MotionLink>

      {hasFooter ? (
        <div className="border-t border-white/10 bg-black">
          <div
            className="grid-container gap-y-2 text-center md:text-left"
            style={{
              paddingBottom: getSpacingRem(resolvedDesign.footerTopSpacing),
              paddingTop: getSpacingRem(resolvedDesign.footerTopSpacing),
            }}
          >
            {hasEditableTextContent(footerLeft) ? (
              <ComponentLayoutNode
                className={!componentLayout
                  ? getResponsiveGridColumnClassName(
                    resolvedDesign.footerLeftBounds,
                  )
                  : undefined}
                layout={componentLayout}
                nodeId="footerLeft"
              >
                <Typography
                  as="span"
                  preset={footerLeftTypography?.preset ?? "sans-body"}
                  size={footerLeftTypography?.size ?? "caption"}
                  weight="semantic"
                  wrapPolicy={footerLeftTypography?.wrap ?? "label"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "footerLeft",
                  )}
                  className="text-textMuted"
                >
                  {footerLeft}
                </Typography>
              </ComponentLayoutNode>
            ) : null}
            {hasEditableTextContent(footerRight) ? (
              <ComponentLayoutNode
                layout={componentLayout}
                nodeId="footerRight"
              >
                <Typography
                  as="span"
                  preset={footerRightTypography?.preset ?? "sans-body"}
                  size={footerRightTypography?.size ?? "caption"}
                  weight="semantic"
                  wrapPolicy={footerRightTypography?.wrap ?? "label"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "footerRight",
                    "right",
                  )}
                  className="text-textMuted"
                >
                  {footerRight}
                </Typography>
              </ComponentLayoutNode>
            ) : null}
          </div>
        </div>
      ) : null}
    </footer>
  );
}
