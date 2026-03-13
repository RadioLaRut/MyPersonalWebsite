"use client";

import React, { type ReactNode, useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

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

/**
 * 检测设备是否为桌面环境
 * 综合判断指针精度、触摸支持和屏幕尺寸
 */
function isDesktopEnvironment(): boolean {
  if (typeof window === "undefined") return true;

  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isLargeScreen = window.innerWidth >= 1024;
  const hasHover = window.matchMedia("(hover: hover)").matches;

  return hasFinePointer && (!isTouchDevice || isLargeScreen) && hasHover;
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
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const entryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkEnvironment = () => {
      setIsMobile(!isDesktopEnvironment());
    };

    checkEnvironment();
    window.addEventListener("resize", checkEnvironment);
    return () => window.removeEventListener("resize", checkEnvironment);
  }, []);

  /**
   * 移动端中心感应区域检测
   * 当用户手指/光标进入屏幕中心30%区域时触发悬停状态
   */
  useEffect(() => {
    if (!isMobile || editMode) return;

    const handlePointerMove = (e: PointerEvent | TouchEvent) => {
      if (!entryRef.current) return;

      const rect = entryRef.current.getBoundingClientRect();
      const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;

      if (clientY === undefined) return;

      // 计算元素在视口中的位置
      const elementCenterY = rect.top + rect.height / 2;
      const viewportCenterY = window.innerHeight / 2;

      // 定义中心感应区域：视口中心上下各15%（共30%）
      const zoneHeight = window.innerHeight * 0.3;
      const zoneTop = viewportCenterY - zoneHeight / 2;
      const zoneBottom = viewportCenterY + zoneHeight / 2;

      // 检测元素中心是否在感应区域内
      const inZone = elementCenterY >= zoneTop && elementCenterY <= zoneBottom;
      setIsExpanded(inZone);
    };

    window.addEventListener("scroll", handlePointerMove as EventListener, { passive: true });
    window.addEventListener("touchmove", handlePointerMove as EventListener, { passive: true });

    // 初始检测
    handlePointerMove(new TouchEvent("touchmove", {
      touches: [new Touch({
        identifier: 0,
        target: document.body,
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2,
      })]
    }) as unknown as TouchEvent);

    return () => {
      window.removeEventListener("scroll", handlePointerMove as EventListener);
      window.removeEventListener("touchmove", handlePointerMove as EventListener);
    };
  }, [isMobile, editMode]);

  const handleInteraction = () => {
    if (!editMode && href) {
      window.location.href = href;
    }
  };

  const active = editMode || isExpanded;
  const cursorClass = editMode ? "cursor-default" : "interactive cursor-pointer";

  return (
    <div
      ref={entryRef}
      className={`group relative grid min-h-[34vh] w-full content-center border-b border-white/10 ${cursorClass} sm:min-h-[42vh]`}
      onClick={handleInteraction}
      onMouseEnter={() => !isMobile && !editMode && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && !editMode && setIsExpanded(false)}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.52)_40%,rgba(0,0,0,0.8)_100%)]" />
            <motion.div
              initial={editMode ? false : { scale: 1.05 }}
              animate={editMode ? undefined : { scale: 1 }}
              transition={editMode ? undefined : { duration: 5, ease: "easeOut" }}
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
        )}
      </AnimatePresence>

      <div className={`grid-container relative z-10 items-center py-16 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className="hidden lg:block col-span-1 text-textMuted">
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

        <div className="grid-content grid content-center py-4 lg:col-span-7">
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
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="grid-sidebar mt-6 grid content-center lg:mt-0 lg:pl-8"
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
    </div>
  );
}
