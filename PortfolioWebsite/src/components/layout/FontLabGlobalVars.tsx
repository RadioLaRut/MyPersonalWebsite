"use client";

import { useEffect, useRef } from "react";

import { FONT_LAB_UPDATED_EVENT } from "@/lib/font-lab-events";
import { applyFontLabCssVars, type FontLabCssVars } from "@/lib/font-lab-css-vars";

export default function FontLabGlobalVars({
  initialVars,
}: {
  initialVars: FontLabCssVars;
}) {
  const appliedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    applyFontLabCssVars(document.documentElement, initialVars, appliedKeysRef.current);
  }, [initialVars]);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const nextVars = (event as CustomEvent<FontLabCssVars>).detail;

      if (!nextVars || typeof nextVars !== "object") {
        return;
      }

      applyFontLabCssVars(document.documentElement, nextVars, appliedKeysRef.current);
    };

    window.addEventListener(FONT_LAB_UPDATED_EVENT, handleUpdate as EventListener);

    return () => {
      window.removeEventListener(FONT_LAB_UPDATED_EVENT, handleUpdate as EventListener);
    };
  }, []);

  return null;
}

export { FONT_LAB_UPDATED_EVENT };
