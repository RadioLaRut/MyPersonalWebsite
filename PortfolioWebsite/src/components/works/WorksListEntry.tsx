"use client";

import React, { type ReactNode, useRef, useState } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { MotionLink } from "@/components/motion/MotionLink";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import {
  AnimatePresence,
  imageSettleVariants,
  motion,
  motionTransitions,
  useCenterZoneActivation,
  useInputCapabilities,
} from "@/lib/motion";

export type WorksListEntryAlias = {
  slug: string;
};

interface WorksListEntryProps extends ComponentDesignOverride<"WorksListEntry"> {
  aliases?: WorksListEntryAlias[];
  id: string;
  number?: string;
  href?: string;
  title: ReactNode;
  category: ReactNode;
  imageSrc: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  desc: ReactNode;
  editMode?: boolean;
}

export default function WorksListEntry({
  number,
  href,
  title,
  category,
  imageSrc,
  imagePreset = "ratio-21-9",
  imageFitMode = "x",
  desc,
  editMode = false,
  design: designOverride,
}: WorksListEntryProps) {
  const design = resolveComponentDesign("WorksListEntry", designOverride);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const entryRef = useRef<HTMLElement>(null);
  const { supportsHoverIntent } = useInputCapabilities();
  const isInsideCenterZone = useCenterZoneActivation(entryRef, {
    enabled: !supportsHoverIntent && !editMode,
  });
  const isLinkEnabled = !editMode && Boolean(href);
  const active = isHovered || isFocused || isInsideCenterZone;
  const cursorClass = isLinkEnabled ? "cursor-pointer" : "cursor-default";
  const numberBoundsClassName = getResponsiveGridColumnClassName(design.numberBounds);
  const titleBoundsClassName = getResponsiveGridColumnClassName(
    createResponsiveGridBounds(
      { leftCol: 3, rightCol: 12 },
      design.titleBounds.md,
      design.titleBounds.lg,
    ),
  );
  const sidebarBoundsClassName = getResponsiveGridColumnClassName(
    createResponsiveGridBounds(
      { leftCol: 3, rightCol: 12 },
      design.sidebarBounds.md,
      design.sidebarBounds.lg,
    ),
  );

  return (
    <MotionLink
      ref={entryRef}
      href={href || "#"}
      disabled={!isLinkEnabled}
      disabledElement="div"
      interactionPreset="blockLink"
      className={`group relative grid min-h-[calc(var(--site-viewport-unit)*26)] w-full content-center border-b border-white/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-white/70 ${cursorClass} sm:min-h-[calc(var(--site-viewport-unit)*30)] md:min-h-[calc(var(--site-viewport-unit)*34)] lg:min-h-[calc(var(--site-viewport-unit)*42)]`}
      data-active={active ? "true" : "false"}
      aria-label={
        typeof title === "string"
          ? `打开作品 ${title}${typeof category === "string" ? `，${category}` : ""}`
          : "打开作品"
      }
      onMouseEnter={() => supportsHoverIntent && !editMode && setIsHovered(true)}
      onMouseLeave={() => supportsHoverIntent && !editMode && setIsHovered(false)}
      onFocus={() => !editMode && setIsFocused(true)}
      onBlur={() => !editMode && setIsFocused(false)}
    >
      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionTransitions.fade}
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.52)_40%,rgba(0,0,0,0.8)_100%)]" />
            <motion.div
              initial={editMode ? false : "hidden"}
              animate={editMode ? undefined : "visible"}
              variants={editMode ? undefined : imageSettleVariants}
              className="h-full w-full"
            >
              <PresetImage
                src={imageSrc}
                alt={typeof title === "string" ? title : "Work entry"}
                preset={imagePreset}
                fitMode={imageFitMode}
                fitModeByBreakpoint={{
                  base: imagePreset === "native" ? "x" : "cover",
                  lg: imageFitMode,
                }}
                lockFrame={false}
                frameClassName="h-full w-full"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className={`grid-container relative z-10 items-baseline py-8 md:py-12 lg:py-16 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className="col-start-1 col-span-2 self-baseline md:hidden">
          <div className="relative grid w-fit">
            <Typography
              preset="sans-body"
              size="label"
              weight="semantic"
              wrapPolicy="label"
              className={`transition-colors duration-700 ease-out ${active ? "text-white/[0.76]" : "text-textMuted"}`}
            >
              {number ?? "00"}
            </Typography>
            <span
              className={`absolute top-full mt-3 h-px bg-white/60 transition-[width,opacity] duration-700 ease-out ${active ? "w-4 opacity-100" : "w-2 opacity-40"}`}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className={`hidden self-baseline lg:block ${numberBoundsClassName}`}>
          <div className="relative grid w-fit content-center">
            <Typography
              preset="sans-body"
              size="title-sm"
              weight="semantic"
              wrapPolicy="label"
              className={`transition-colors duration-700 ease-out ${active ? "text-white/[0.76]" : "text-textMuted"}`}
            >
              {number ?? "00"}
            </Typography>
            <span
              className={`absolute top-full mt-3 h-px bg-white/60 transition-[width,opacity] duration-700 ease-out ${active ? "w-4 opacity-100" : "w-0 opacity-0"}`}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className={`${titleBoundsClassName} grid self-baseline content-center py-4`}>
          <Typography
            as="h2"
            preset="luna-editorial"
            size="title"
            weight="display"
            wrapPolicy="heading"
            className={`break-words py-2 uppercase transition-all duration-700 ease-out ${active
              ? "text-white/[0.92]"
              : "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.42)]"}`}
          >
            {title}
          </Typography>
        </div>

        <div className={`${sidebarBoundsClassName} mt-4 grid self-center content-center md:mt-0 md:pl-6 lg:pl-8`}>
          <div className="grid gap-1">
            <Typography
              as="p"
              preset="gothic-editorial"
              size="label"
              weight="semantic"
              wrapPolicy="prose"
              className={`uppercase transition-colors duration-700 ease-out ${active ? "text-textPrimary" : "text-textSecondary"}`}
            >
              {category}
            </Typography>
            <motion.div
              initial={false}
              animate={{ opacity: active ? 1 : 0, x: active ? 0 : -10 }}
              transition={motionTransitions.fade}
              aria-hidden={!active}
            >
              <Typography
                as="p"
                preset="sans-body"
                size="body-sm"
                weight="light"
                wrapPolicy="prose"
                className="mt-4 text-textSecondary"
              >
                {desc}
              </Typography>
            </motion.div>
          </div>
        </div>
      </div>
    </MotionLink>
  );
}
