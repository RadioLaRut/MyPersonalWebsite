"use client";

import { useEffect, useRef, useState } from "react";

import { PresetImage } from "@/components/common/PresetImage";
import type { ImageFitMode, ImagePreset } from "@/lib/image-presentation";
import {
  resolveInputCapabilities,
  useInputCapabilities,
} from "@/lib/motion/input";
import {
  isElementCenterInsideViewportZone,
} from "@/lib/motion/scroll";
import { subscribeViewportRaf } from "@/lib/motion/viewport-raf";

export default function WorksListEntryActivation({
  imageAlt,
  imageFitMode,
  imagePreset,
  imageSrc,
}: {
  imageAlt: string;
  imageFitMode: ImageFitMode;
  imagePreset: ImagePreset;
  imageSrc: string;
}) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const [hasActivated, setHasActivated] = useState(false);
  const inputCapabilities = useInputCapabilities();

  useEffect(() => {
    const entry = markerRef.current?.closest<HTMLElement>("[data-works-entry]");
    if (!entry) return;
    const { supportsHoverIntent } = resolveInputCapabilities();
    let hovered = false;
    let focused = false;
    let centered = false;

    const synchronize = () => {
      const isActive = hovered || focused || centered;
      entry.dataset.active = isActive ? "true" : "false";
      if (isActive) {
        setHasActivated(true);
      }
    };
    const handlePointerEnter = () => {
      if (!supportsHoverIntent) return;
      hovered = true;
      synchronize();
    };
    const handlePointerLeave = () => {
      hovered = false;
      synchronize();
    };
    const handleFocusIn = () => {
      focused = true;
      synchronize();
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (
        event.relatedTarget instanceof Node &&
        entry.contains(event.relatedTarget)
      ) {
        return;
      }
      focused = false;
      synchronize();
    };
    const updateCenterZone = () => {
      centered =
        !supportsHoverIntent &&
        isElementCenterInsideViewportZone(
          entry.getBoundingClientRect(),
          window.innerHeight,
        );
      synchronize();
    };

    entry.addEventListener("pointerenter", handlePointerEnter);
    entry.addEventListener("pointerleave", handlePointerLeave);
    entry.addEventListener("focusin", handleFocusIn);
    entry.addEventListener("focusout", handleFocusOut);
    const unsubscribe = subscribeViewportRaf(window, updateCenterZone);

    return () => {
      unsubscribe();
      entry.removeEventListener("pointerenter", handlePointerEnter);
      entry.removeEventListener("pointerleave", handlePointerLeave);
      entry.removeEventListener("focusin", handleFocusIn);
      entry.removeEventListener("focusout", handleFocusOut);
    };
  }, [inputCapabilities.supportsHoverIntent]);

  return (
    <>
      {hasActivated && imageSrc ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0 transition-opacity duration-700 ease-out group-data-[active=true]:opacity-100">
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.52)_40%,rgba(0,0,0,0.8)_100%)]" />
          <div className="h-full w-full scale-[1.025] transition-transform duration-[5000ms] ease-out group-data-[active=true]:scale-100">
            <PresetImage
              src={imageSrc}
              alt={imageAlt}
              preset={imagePreset}
              fitMode={imageFitMode}
              loading="lazy"
              mediaProfile="grid-5"
              fitModeByBreakpoint={{
                base: imagePreset === "native" ? "x" : "cover",
                lg: imageFitMode,
              }}
              lockFrame={false}
              frameClassName="h-full w-full"
            />
          </div>
        </div>
      ) : null}
      <span ref={markerRef} className="hidden" aria-hidden="true" />
    </>
  );
}
