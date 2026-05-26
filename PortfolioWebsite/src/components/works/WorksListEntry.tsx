"use client";

import React, { type ReactNode, useRef, useState } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import { MotionLink } from "@/components/motion";
import { getResponsiveGridColumnClassName } from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import {
  AnimatePresence,
  imageSettleVariants,
  motion,
  motionTransitions,
  useCenterZoneActivation,
  useInputCapabilities,
} from "@/lib/motion";

interface WorksListEntryProps {
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
}: WorksListEntryProps) {
  const design = useComponentDesign("WorksListEntry");
  const [isHovered, setIsHovered] = useState(false);
  const entryRef = useRef<HTMLElement>(null);
  const { supportsHoverIntent } = useInputCapabilities();
  const isInsideCenterZone = useCenterZoneActivation(entryRef, {
    enabled: !supportsHoverIntent && !editMode,
  });
  const isLinkEnabled = !editMode && Boolean(href);
  const active = editMode || isHovered || isInsideCenterZone;
  const cursorClass = isLinkEnabled ? "cursor-pointer" : "cursor-default";
  const numberBoundsClassName = getResponsiveGridColumnClassName(design.numberBounds);
  const titleBoundsClassName = getResponsiveGridColumnClassName(design.titleBounds);
  const sidebarBoundsClassName = getResponsiveGridColumnClassName(design.sidebarBounds);

  return (
    <MotionLink
      ref={entryRef}
      href={href || "#"}
      disabled={!isLinkEnabled}
      disabledElement="div"
      interactionPreset="blockLink"
      className={`group relative grid min-h-[34vh] w-full content-center border-b border-white/10 ${cursorClass} sm:min-h-[42vh]`}
      aria-label={typeof title === "string" ? `Open ${title}` : "Open work"}
      onMouseEnter={() => supportsHoverIntent && !editMode && setIsHovered(true)}
      onMouseLeave={() => supportsHoverIntent && !editMode && setIsHovered(false)}
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
                lockFrame={false}
                frameClassName="h-full w-full"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className={`grid-container relative z-10 items-center py-16 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`hidden text-textMuted lg:block ${numberBoundsClassName}`}>
          <Typography
            preset="sans-body"
            size="title-sm"
            weight="semantic"
            wrapPolicy="label"
            className="text-textMuted"
          >
            {number ?? "00"}
          </Typography>
        </div>

        <div className={`${titleBoundsClassName} grid content-center py-4`}>
          <Typography
            as="h2"
            preset="luna-editorial"
            size="title"
            weight="display"
            wrapPolicy="heading"
            className={`py-2 uppercase transition-all duration-700 ease-out ${active
              ? "text-white"
              : "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.3)]"}`}
          >
            {title}
          </Typography>
        </div>

        <motion.div
          initial={false}
          animate={{
            opacity: active ? 1 : 0,
            x: active ? 0 : -20,
          }}
          transition={motionTransitions.fade}
          className={`${sidebarBoundsClassName} mt-6 grid content-center lg:mt-0 lg:pl-8`}
        >
          <div className="grid gap-1">
            <Typography
              as="p"
              preset="gothic-editorial"
              size="label"
              weight="semantic"
              wrapPolicy="label"
              className="text-textPrimary"
            >
              {category}
            </Typography>
            <Typography
              as="p"
              preset="sans-body"
              size="body"
              weight="light"
              wrapPolicy="prose"
              className="mt-4 text-textMuted"
            >
              {desc}
            </Typography>
          </div>
        </motion.div>
      </div>
    </MotionLink>
  );
}
