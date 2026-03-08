"use client";

import React, { type ReactNode, useEffect, useState } from "react";
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

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const handleInteraction = () => {
    if (editMode || !href) {
      return;
    }

    if (isMobile) {
      if (isExpanded) {
        window.location.href = href;
      } else {
        setIsExpanded(true);
      }
      return;
    }

    window.location.href = href;
  };

  const active = editMode ? true : isExpanded;

  return (
    <div
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
        <div className="hidden md:block col-span-1 text-white/40 font-futura text-xl tracking-widest">
          {number ?? "00"}
        </div>

        <div className="col-span-4 md:col-start-2 md:col-span-7 flex flex-col justify-center py-4">
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
          className="col-span-4 md:col-start-9 md:col-span-4 flex flex-col justify-center md:border-l md:border-white/20 md:pl-8 mt-6 md:mt-0"
        >
          {isMobile && !editMode ? (
            <p className="text-white/40 text-[10px] tracking-widest uppercase mb-4">
              Tap again to view details
            </p>
          ) : null}
          <p className="font-serif font-semibold tracking-widest text-sm sm:text-base text-white/90 uppercase">
            {category}
          </p>
          <p className="mt-3 text-[10px] sm:text-xs text-white/60 font-futura font-medium tracking-[0.14em] uppercase leading-loose">
            <BilingualText text={desc} />
          </p>
        </motion.div>
      </div>
    </div>
  );
}
