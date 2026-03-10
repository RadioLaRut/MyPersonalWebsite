"use client";

import React, { type ReactNode, useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import BilingualText from "@/components/common/BilingualText";
import { PresetImage } from "@/components/common/PresetImage";
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
    handlePointerMove(new TouchEvent("touchmove", { touches: [new Touch({
      identifier: 0,
      target: document.body,
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2,
    })] }) as unknown as TouchEvent);

    return () => {
      window.removeEventListener("scroll", handlePointerMove as EventListener);
      window.removeEventListener("touchmove", handlePointerMove as EventListener);
    };
  }, [isMobile, editMode]);

  const handleInteraction = () => {
    if (editMode || !href) {
      return;
    }

    // 移动端直接跳转，无需二次确认
    if (isMobile) {
      window.location.href = href;
      return;
    }

    window.location.href = href;
  };

  const active = editMode ? true : isExpanded;

  return (
    <div
      ref={entryRef}
      className={`relative w-full border-b border-white/10 group min-h-[30vh] sm:min-h-[40vh] flex flex-col justify-center ${editMode ? "cursor-default" : "interactive cursor-pointer"}`}
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
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/60 z-10 mix-blend-multiply" />
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

      <div className={`grid-container relative z-10 items-center py-12 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className="hidden lg:block col-span-1 text-textMuted font-futura text-xl tracking-widest">
          {number ?? "00"}
        </div>

        <div className="grid-content lg:col-span-7 flex flex-col justify-center py-4">
          <h2
            className={`text-6xl sm:text-[4vw] font-black tracking-tighter uppercase leading-none font-luna transition-all duration-700 ease-out whitespace-normal break-words py-2 ${active
              ? "text-white"
              : "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.3)]"}`}
          >
            {title}
          </h2>
        </div>

        <motion.div
          initial={false}
          animate={{
            opacity: active ? 1 : 0,
            x: active ? 0 : -20,
          }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="grid-sidebar flex flex-col justify-center lg:border-l lg:border-white/20 lg:pl-8 mt-6 lg:mt-0"
        >
          <p className="font-serif font-semibold tracking-widest text-sm sm:text-base text-textPrimary uppercase">
            {category}
          </p>
          <p className="mt-3 text-[10px] sm:text-xs text-textMuted font-medium tracking-[0.14em] uppercase leading-loose [&_span]:align-[-0.06em]">
            <BilingualText text={desc} weight="light" />
          </p>
        </motion.div>
      </div>
    </div>
  );
}
