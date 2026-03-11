"use client";

import { useEffect, useRef } from "react";

import type { FontLabCssVars } from "@/lib/font-lab-css-vars";

const FONT_LAB_UPDATED_EVENT = "font-lab-config-updated";

function applyVars(
  target: HTMLElement,
  nextVars: FontLabCssVars,
  previousKeys: Set<string>,
) {
  previousKeys.forEach((key) => {
    if (!(key in nextVars)) {
      target.style.removeProperty(key);
    }
  });

  Object.entries(nextVars).forEach(([key, value]) => {
    target.style.setProperty(key, value);
  });

  previousKeys.clear();
  Object.keys(nextVars).forEach((key) => previousKeys.add(key));
}

export default function FontLabGlobalVars({
  initialVars,
}: {
  initialVars: FontLabCssVars;
}) {
  const appliedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    applyVars(document.documentElement, initialVars, appliedKeysRef.current);
  }, [initialVars]);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const nextVars = (event as CustomEvent<FontLabCssVars>).detail;

      if (!nextVars || typeof nextVars !== "object") {
        return;
      }

      applyVars(document.documentElement, nextVars, appliedKeysRef.current);
    };

    window.addEventListener(FONT_LAB_UPDATED_EVENT, handleUpdate as EventListener);

    return () => {
      window.removeEventListener(FONT_LAB_UPDATED_EVENT, handleUpdate as EventListener);
    };
  }, []);

  return null;
}

export { FONT_LAB_UPDATED_EVENT };
