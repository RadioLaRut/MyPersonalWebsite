import React, { type ReactNode } from "react";
import { PresetImage } from "@/components/common/PresetImage";
import ComponentLayoutNode, {
  getComponentLabNodeAttributes,
  getComponentLayoutAlignment,
  getComponentLayoutOpticalPull,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography from "@/components/common/Typography";
import { MotionLink } from "@/components/motion/MotionLink";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getResponsiveGridColumnClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";
import { PUBLIC_COPY } from "@/lib/public-copy";
import { motionClassNames } from "@/lib/motion/classes";
import { segmentTypographyText } from "@/lib/typography";

interface ProjectSectionProps extends ComponentDesignOverride<"ProjectSection">, ComponentLayoutProps {
  title: ReactNode;
  imageSrc?: string;
  subtitle?: ReactNode;
  link?: string;
  index?: number;
  align?: "auto" | "left" | "right";
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  mobileImageFocalX?: number;
  mobileImageFocalY?: number;
  publicMediaHint?: PublicMediaHint;
  editMode?: boolean;
}

export default function ProjectSection({
  title,
  imageSrc,
  subtitle,
  link,
  index = 0,
  align = "auto",
  componentLayout,
  imagePreset = "ratio-16-9",
  imageFitMode = "x",
  mobileImageFocalX = 50,
  mobileImageFocalY = 50,
  publicMediaHint,
  editMode = false,
  design: designOverride,
}: ProjectSectionProps) {
  const design = resolveComponentDesign("ProjectSection", designOverride);
  const plainTitle = toPlainText(title);
  const imageAlt = plainTitle ?? PUBLIC_COPY.fallbacks.projectCoverAlt;
  const isLinkEnabled = !editMode && Boolean(link);
  const cursorClass = isLinkEnabled ? "cursor-pointer" : "cursor-default";
  const sectionClassName = [
    "relative m-0 grid min-h-[calc(var(--site-viewport-unit)*100)] w-full place-items-center overflow-hidden p-0 mix-blend-normal group",
    cursorClass,
    componentLayout
      ? getComponentSectionProfileClassName(componentLayout)
      : "",
  ].filter(Boolean).join(" ");
  const mediaLayerClassName = "absolute inset-x-0 -inset-y-[10%] grid place-items-center px-0 lg:inset-0";

  const shouldAlignRight = align === "right" || (align === "auto" && index % 2 !== 0);
  const textColumnClassName = shouldAlignRight
    ? "justify-items-end text-right"
    : "justify-items-start";
  const lockupClassName = shouldAlignRight
    ? "ml-auto justify-items-end text-right"
    : "mr-auto justify-items-start text-left";
  const titleLockupClassName = shouldAlignRight
    ? "justify-self-end justify-items-end"
    : "justify-self-start justify-items-start";

  const underlineTrackClassName = shouldAlignRight ? "justify-end" : "justify-start";
  const underlineFillClassName =
    `w-[18%] bg-white/[0.45] ${motionClassNames.projectUnderline} group-hover:w-full group-hover:bg-white/[0.82] group-focus-visible:w-full group-focus-visible:bg-white/[0.82]`;
  const textBoundsClassName = getResponsiveGridColumnClassName(
    shouldAlignRight ? design.textRightBounds : design.textLeftBounds,
  );
  const lockupGap = getSpacingRem(design.lockupGap);
  const titleHasCjkRun = segmentTypographyText(plainTitle ?? "").some(
    (run) => run.type === "text" && run.script === "cjk",
  );
  const titleUnderlineCjkMetricClearance = titleHasCjkRun
    ? getSpacingRem(design.titleUnderlineCjkMetricClearance)
    : "0rem";
  const titleUnderlineOpticalPull = getSpacingRem(design.titleUnderlineOpticalPull);
  const layoutOpticalPull = `${getComponentLayoutOpticalPull(componentLayout, "title")}px`;
  const underlineOffset = `max(0px, calc(${lockupGap} + ${titleUnderlineCjkMetricClearance} - ${
    componentLayout ? layoutOpticalPull : titleUnderlineOpticalPull
  }))`;
  const subtitleTypography = getComponentLayoutTypography(componentLayout, "subtitle");
  const titleTypography = getComponentLayoutTypography(componentLayout, "title");
  const titleRowClassName = hasEditableTextContent(subtitle)
    ? "row-start-2"
    : "row-start-1";
  const hasActiveUnderlinePositioning = (
    breakpoint: "desktop" | "mobile" | "tablet",
  ) => {
    const positioning =
      componentLayout?.nodes.underline?.positioning?.[breakpoint];
    return positioning?.mode === "overlay" &&
      (
        positioning.anchored === true ||
        positioning.anchor !== "center" ||
        positioning.offset !== 0
      );
  };
  const underlineDefaultOffsetStyle = {
    "--project-underline-offset-desktop":
      hasActiveUnderlinePositioning("desktop") ? "0px" : underlineOffset,
    "--project-underline-offset-mobile":
      hasActiveUnderlinePositioning("mobile") ? "0px" : underlineOffset,
    "--project-underline-offset-tablet":
      hasActiveUnderlinePositioning("tablet") ? "0px" : underlineOffset,
  } as React.CSSProperties;

  return (
    <MotionLink
      href={link || "#"}
      disabled={!isLinkEnabled}
      disabledElement="section"
      interactionPreset="blockLink"
      aria-label={
        plainTitle
          ? `Open ${plainTitle}`
          : PUBLIC_COPY.fallbacks.projectLinkLabel
      }
      className={sectionClassName}
      data-public-motion-kind={editMode ? undefined : "project"}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div
        className={`${mediaLayerClassName} bg-[#111]`}
        {...getComponentLabNodeAttributes(componentLayout, "media")}
        data-public-motion-media={editMode ? undefined : "true"}
      >
        {/* Environment ambient gradient/shadow to improve contrast */}
        <div className={`absolute inset-0 z-10 bg-black/[0.32] custom-blend ${motionClassNames.projectBackdrop} group-hover:bg-black/[0.24] group-focus-visible:bg-black/[0.24]`} />

        <div className="project-section-edge-shade absolute inset-0 z-10" />

        {imageSrc ? (
          <PresetImage
            src={imageSrc}
            alt={imageAlt}
            preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload}
            mediaProfile="full-bleed"
            sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined}
            preset={imagePreset}
            fitMode={imageFitMode}
            fitModeByBreakpoint={{ base: "cover", lg: imageFitMode }}
            objectPositionByBreakpoint={{
              base: { x: mobileImageFocalX, y: mobileImageFocalY },
              lg: { x: 50, y: 50 },
            }}
            lockFrame={false}
            frameClassName="h-full w-full"
            imageClassName="select-none"
          />
        ) : null}
      </div>

      <div
        data-public-motion-content={editMode ? undefined : "true"}
        className={`absolute inset-0 z-20 grid content-center ${
          componentLayout ? "" : "rhythm-section-normal"
        } ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div className="grid-container relative w-full mix-blend-difference">
          {componentLayout ? (
            <>
              {hasEditableTextContent(subtitle) ? (
                <ComponentLayoutNode layout={componentLayout} nodeId="subtitle">
                  <Typography
                    as="p"
                    preset={subtitleTypography?.preset ?? "sans-body"}
                    size={subtitleTypography?.size ?? "label"}
                    weight="semantic"
                    wrapPolicy={subtitleTypography?.wrap ?? "label"}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      "subtitle",
                      shouldAlignRight ? "right" : "left",
                    )}
                    className="text-textPrimary"
                  >
                    {subtitle}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
              <ComponentLayoutNode
                gapFrom={hasEditableTextContent(subtitle) ? "subtitle" : undefined}
                layout={componentLayout}
                nodeId="title"
                className={`${titleRowClassName} relative grid w-fit max-w-full auto-rows-max gap-y-0 ${
                  getComponentLayoutAlignment(componentLayout, "title") === "right"
                    ? "justify-self-end justify-items-end"
                    : "justify-self-start justify-items-start"
                }`}
              >
                <Typography
                  as="h2"
                  preset={titleTypography?.preset ?? "luna-editorial"}
                  size={titleTypography?.size ?? "display"}
                  weight="semantic"
                  wrapPolicy={titleTypography?.wrap ?? "heading"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "title",
                    shouldAlignRight ? "right" : "left",
                  )}
                  className="max-w-full text-white antialiased uppercase [transform:translateZ(0)] lg:whitespace-nowrap"
                >
                  {title}
                </Typography>
              </ComponentLayoutNode>
              <ComponentLayoutNode
                className={`${titleRowClassName} pointer-events-none self-end`}
                layout={componentLayout}
                nodeId="underline"
              >
                <div
                  aria-hidden="true"
                  className={`flex w-full [transform:translateY(var(--project-underline-offset-mobile))] md:[transform:translateY(var(--project-underline-offset-tablet))] lg:[transform:translateY(var(--project-underline-offset-desktop))] ${
                    getComponentLayoutAlignment(componentLayout, "title") === "right"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                  style={underlineDefaultOffsetStyle}
                >
                  <div className={`h-[2px] ${underlineFillClassName}`} />
                </div>
              </ComponentLayoutNode>
            </>
          ) : (
          <div className={`${textBoundsClassName} grid content-start ${textColumnClassName}`}>
            <div className={`grid max-w-full auto-rows-max gap-y-0 ${lockupClassName}`}>
              {hasEditableTextContent(subtitle) && (
                <Typography
                  as="p"
                  preset="sans-body"
                  size="label"
                  weight="semantic"
                  wrapPolicy="label"
                  align={shouldAlignRight ? "right" : "left"}
                  className="text-textPrimary"
                  style={{ marginBottom: lockupGap }}
                >
                  {subtitle}
                </Typography>
              )}
              <div className={`relative grid w-fit max-w-full auto-rows-max gap-y-0 ${titleLockupClassName}`}>
                <Typography
                  as="h2"
                  preset="luna-editorial"
                  size={design.titleSize}
                  weight="semantic"
                  wrapPolicy="heading"
                  align={shouldAlignRight ? "right" : "left"}
                  className="max-w-full text-white antialiased uppercase [transform:translateZ(0)] lg:whitespace-nowrap"
                >
                  {title}
                </Typography>
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 flex ${underlineTrackClassName}`}
                  style={{ top: `calc(100% + ${underlineOffset})` }}
                >
                  <div className={`h-[2px] ${underlineFillClassName}`} />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </MotionLink>
  );
}
