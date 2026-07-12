"use client";
import React, { type ReactNode, useRef } from "react";
import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import { MotionLink } from "@/components/motion";
import {
  getResponsiveGridColumnClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import {
  motion,
  motionClassNames,
  motionScrollTokens,
  useScroll,
  useTransform,
} from "@/lib/motion";

interface ProjectSectionProps {
  title: ReactNode;
  imageSrc: string;
  subtitle?: ReactNode;
  link?: string;
  index?: number;
  align?: "auto" | "left" | "right";
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  mobileImageFocalX?: number;
  mobileImageFocalY?: number;
  editMode?: boolean;
}

export default function ProjectSection({
  title,
  imageSrc,
  subtitle,
  link,
  index = 0,
  align = "auto",
  imagePreset = "ratio-16-9",
  imageFitMode = "x",
  mobileImageFocalX = 50,
  mobileImageFocalY = 50,
  editMode = false,
}: ProjectSectionProps) {
  const design = useComponentDesign("ProjectSection");
  const containerRef = useRef<HTMLElement>(null);
  const imageAlt = typeof title === "string" ? title : "Project cover";
  const isLinkEnabled = !editMode && Boolean(link);
  const cursorClass = isLinkEnabled ? "cursor-pointer" : "cursor-default";
  const sectionClassName = `relative m-0 grid min-h-[100svh] w-full place-items-center overflow-hidden p-0 mix-blend-normal group ${cursorClass}`;
  const mediaLayerClassName = "absolute inset-x-0 -inset-y-[10%] grid place-items-center px-0 lg:inset-0";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    motionScrollTokens.projectMedia.input,
    motionScrollTokens.projectMedia.y,
  );
  const scale = useTransform(
    scrollYProgress,
    motionScrollTokens.projectMedia.input,
    motionScrollTokens.projectMedia.scale,
  );
  const opacity = useTransform(
    scrollYProgress,
    motionScrollTokens.projectContent.input,
    motionScrollTokens.projectContent.opacity,
  );
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
  const titleUnderlineOpticalPull = getSpacingRem(design.titleUnderlineOpticalPull);
  const adjustedGap = `max(0px, calc(${lockupGap} - ${titleUnderlineOpticalPull}))`;

  return (
    <MotionLink
      ref={containerRef}
      href={link || "#"}
      disabled={!isLinkEnabled}
      disabledElement="section"
      interactionPreset="blockLink"
      aria-label={typeof title === "string" ? `Open ${title}` : "Open project"}
      className={sectionClassName}
    >
      <motion.div
        className={mediaLayerClassName}
        style={editMode ? undefined : { y, scale }}
      >
        {/* Environment ambient gradient/shadow to improve contrast */}
        <div className={`absolute inset-0 z-10 bg-black/[0.32] custom-blend ${motionClassNames.projectBackdrop} group-hover:bg-black/[0.24] group-focus-visible:bg-black/[0.24]`} />

        <div className="project-section-edge-shade absolute inset-0 z-10" />

        <PresetImage
          src={imageSrc}
          alt={imageAlt}
          priority={index === 0}
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
      </motion.div>

      <motion.div
        style={editMode ? undefined : { opacity }}
        className={`absolute inset-0 z-20 grid content-center rhythm-section-normal ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div className="grid-container relative w-full mix-blend-difference">
          <div
            className={`${textBoundsClassName} grid content-start ${textColumnClassName}`}
          >
            <div className={`grid max-w-full auto-rows-max gap-y-0 ${lockupClassName}`}>
              {subtitle && (
                <Typography
                  as="p"
                  preset="sans-body"
                  size="label"
                  weight="semantic"
                  wrapPolicy="label"
                  align={shouldAlignRight ? "right" : "left"}
                  className="text-textPrimary"
                  style={{ marginBottom: adjustedGap }}
                >
                  {subtitle}
                </Typography>
              )}
              <div className={`grid w-fit max-w-full auto-rows-max gap-y-0 ${titleLockupClassName}`}>
                <Typography
                  as="h2"
                  preset="luna-editorial"
                  size={design.titleSize}
                  weight="semantic"
                  wrapPolicy="heading"
                  align={shouldAlignRight ? "right" : "left"}
                  className="max-w-full text-white antialiased uppercase [transform:translateZ(0)] lg:whitespace-nowrap"
                  style={{ marginTop: "-0.15em" }}
                >
                  {title}
                </Typography>
                <div
                  className={`flex w-full ${underlineTrackClassName}`}
                  style={{ marginTop: adjustedGap }}
                >
                  <div className={`h-[2px] ${underlineFillClassName}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MotionLink>
  );
}
