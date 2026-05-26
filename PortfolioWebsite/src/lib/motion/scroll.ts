"use client";

import { type RefObject, useEffect, useState } from "react";

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
  elementRef: RefObject<HTMLElement>,
  options: {
    enabled?: boolean;
    zoneRatio?: number;
  } = {},
) {
  const { enabled = true, zoneRatio = 0.3 } = options;
  const [isInsideZone, setIsInsideZone] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setIsInsideZone(false);
      return;
    }

    let frameId = 0;
    let frameQueued = false;

    const update = () => {
      frameQueued = false;
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

    const queueUpdate = () => {
      if (frameQueued) {
        return;
      }

      frameQueued = true;
      frameId = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    update();

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [elementRef, enabled, zoneRatio]);

  return isInsideZone;
}
