"use client";

import { type RefObject, useEffect, useState } from "react";

import { subscribeViewportRaf } from "./viewport-raf.ts";

export type ViewportRectLike = {
  height: number;
  top: number;
};

export function isElementCenterInsideViewportZone(
  rect: ViewportRectLike,
  viewportHeight: number,
  zoneRatio = 0.3,
) {
  if (viewportHeight <= 0 || rect.height <= 0) {
    return false;
  }

  const safeZoneRatio = Math.max(0, Math.min(1, zoneRatio));
  const elementCenterY = rect.top + rect.height / 2;
  const viewportCenterY = viewportHeight / 2;
  const zoneHeight = viewportHeight * safeZoneRatio;
  const zoneTop = viewportCenterY - zoneHeight / 2;
  const zoneBottom = viewportCenterY + zoneHeight / 2;

  return elementCenterY >= zoneTop && elementCenterY <= zoneBottom;
}

export function useCenterZoneActivation(
  elementRef: RefObject<HTMLElement | null>,
  options: {
    enabled?: boolean;
    zoneRatio?: number;
  } = {},
) {
  const { enabled = true, zoneRatio = 0.3 } = options;
  const [isInsideZone, setIsInsideZone] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const update = () => {
      const element = elementRef.current;

      if (!element) {
        setIsInsideZone(false);
        return;
      }

      setIsInsideZone(
        isElementCenterInsideViewportZone(
          element.getBoundingClientRect(),
          window.innerHeight,
          zoneRatio,
        ),
      );
    };

    return subscribeViewportRaf(window, update);
  }, [elementRef, enabled, zoneRatio]);

  return enabled ? isInsideZone : false;
}
