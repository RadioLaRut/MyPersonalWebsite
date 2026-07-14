"use client";
import React, { useEffect, useRef, useState } from "react";
import { supportsDesktopCustomCursor } from "@/lib/motion";

type CustomCursorProps = {
  targetDocument?: Document;
};

const CUSTOM_CURSOR_ACTIVE_ATTRIBUTE = "data-custom-cursor-active";

export default function CustomCursor({ targetDocument }: CustomCursorProps = {}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isCursorEnabled, setIsCursorEnabled] = useState(false);

  useEffect(() => {
    const win = targetDocument?.defaultView || window;
    const pointerQuery = win.matchMedia("(pointer: fine)");
    const hoverQuery = win.matchMedia("(hover: hover)");
    const reducedMotionQuery = win.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCursorAvailability = () => {
      const nextEnabled = supportsDesktopCustomCursor({
        hasTouchStart: "ontouchstart" in win,
        innerWidth: win.innerWidth,
        matchMedia: win.matchMedia.bind(win),
        maxTouchPoints: win.navigator.maxTouchPoints,
      });

      setIsCursorEnabled(nextEnabled);
    };

    const addMediaListener = (query: MediaQueryList, handler: () => void) => {
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", handler);
        return () => query.removeEventListener("change", handler);
      }

      query.addListener(handler);
      return () => query.removeListener(handler);
    };

    updateCursorAvailability();
    const removePointerListener = addMediaListener(pointerQuery, updateCursorAvailability);
    const removeHoverListener = addMediaListener(hoverQuery, updateCursorAvailability);
    const removeMotionListener = addMediaListener(reducedMotionQuery, updateCursorAvailability);
    win.addEventListener("resize", updateCursorAvailability);

    return () => {
      removePointerListener();
      removeHoverListener();
      removeMotionListener();
      win.removeEventListener("resize", updateCursorAvailability);
    };
  }, [targetDocument]);

  useEffect(() => {
    const htmlElement = (targetDocument ?? document).documentElement;
    if (isCursorEnabled) {
      htmlElement.setAttribute(CUSTOM_CURSOR_ACTIVE_ATTRIBUTE, "true");
    } else {
      htmlElement.removeAttribute(CUSTOM_CURSOR_ACTIVE_ATTRIBUTE);
    }
    return () => htmlElement.removeAttribute(CUSTOM_CURSOR_ACTIVE_ATTRIBUTE);
  }, [isCursorEnabled, targetDocument]);

  useEffect(() => {
    if (!isCursorEnabled) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) {
      return;
    }

    const activeDocument = targetDocument ?? document;
    const win = targetDocument?.defaultView || window;
    let magnetElements = Array.from(
      activeDocument.querySelectorAll<HTMLElement>("[data-cursor-magnet]"),
    );
    let rafId: number;
    let mouseX = win.innerWidth / 2;
    let mouseY = win.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let magnetX = mouseX;
    let magnetY = mouseY;
    let magnetStrength = 0;
    let isPressed = false;
    let activeMagnet: HTMLElement | null = null;

    const clearMagnet = () => {
      magnetStrength = 0;
      cursor.classList.remove("cursor-magnetized");
      cursor.style.removeProperty("--cursor-magnet-size");
      if (activeMagnet) {
        activeMagnet.removeAttribute("data-cursor-magnet-active");
        activeMagnet = null;
      }
    };

    const refreshMagnetElements = () => {
      magnetElements = Array.from(
        activeDocument.querySelectorAll<HTMLElement>("[data-cursor-magnet]"),
      );
      if (
        activeMagnet &&
        (!activeMagnet.isConnected || !activeMagnet.matches("[data-cursor-magnet]"))
      ) {
        clearMagnet();
      }
    };

    const updatePointerTarget = (
      clientX: number,
      clientY: number,
      eventTarget: EventTarget | null,
    ) => {
      mouseX = clientX;
      mouseY = clientY;
      const target = eventTarget as Element | null;

      const isInteractive = target?.closest?.(
        "a, button, input, [role='button'], .interactive",
      );
      const isText = target?.closest?.(".hover-text");
      let nearestMagnet: HTMLElement | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      if (magnetElements.length > 0) {
        for (const magnetElement of magnetElements) {
          const rect = magnetElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.hypot(centerX - clientX, centerY - clientY);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestMagnet = magnetElement;
          }
        }
      } else {
        clearMagnet();
      }

      if (nearestMagnet && nearestDistance < 34) {
        const rect = nearestMagnet.getBoundingClientRect();
        magnetX = rect.left + rect.width / 2;
        magnetY = rect.top + rect.height / 2;
        magnetStrength = 0.42 + (1 - nearestDistance / 34) * 0.38;
        cursor.classList.add("cursor-magnetized");
        cursor.style.setProperty(
          "--cursor-magnet-size",
          `${nearestMagnet.dataset.cursorMagnetSize ?? Math.max(rect.width, rect.height)}px`,
        );

        if (activeMagnet !== nearestMagnet) {
          if (activeMagnet) {
            activeMagnet.removeAttribute("data-cursor-magnet-active");
          }
          activeMagnet = nearestMagnet;
          activeMagnet.setAttribute("data-cursor-magnet-active", "true");
        }
      } else {
        clearMagnet();
      }

      if (isInteractive) {
        cursor.classList.add("hovering-interactive");
        cursor.classList.remove("hovering-text");
      } else if (isText) {
        cursor.classList.add("hovering-text");
        cursor.classList.remove("hovering-interactive");
      } else {
        cursor.classList.remove("hovering-text", "hovering-interactive");
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      updatePointerTarget(event.clientX, event.clientY, event.target);
    };

    const onMouseMove = (event: MouseEvent) => {
      updatePointerTarget(event.clientX, event.clientY, event.target);
    };

    const updateCursor = () => {
      const targetX = mouseX + (magnetX - mouseX) * magnetStrength;
      const targetY = mouseY + (magnetY - mouseY) * magnetStrength;

      // Tight lerp, no bounce. Weakened presence.
      currentX += (targetX - currentX) * 0.6;
      currentY += (targetY - currentY) * 0.6;

      if (cursor) {
        const scale = isPressed ? 0.85 : 1;
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      rafId = requestAnimationFrame(updateCursor);
    };

    const magnetRoot = activeDocument.body ?? activeDocument.documentElement;
    const magnetObserver = new win.MutationObserver(refreshMagnetElements);
    magnetObserver.observe(magnetRoot, {
      attributeFilter: ["data-cursor-magnet"],
      attributes: true,
      childList: true,
      subtree: true,
    });

    const supportsPointerEvents = "PointerEvent" in win;
    if (supportsPointerEvents) {
      activeDocument.addEventListener("pointermove", onPointerMove, {
        capture: true,
        passive: true,
      });
    } else {
      activeDocument.addEventListener("mousemove", onMouseMove, {
        capture: true,
        passive: true,
      });
    }
    updateCursor();

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button === 0) {
        isPressed = true;
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        isPressed = false;
      }
    };
    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }

      isPressed = true;
    };
    const onMouseUp = () => {
      isPressed = false;
    };

    if (supportsPointerEvents) {
      activeDocument.addEventListener("pointerdown", onPointerDown, true);
      activeDocument.addEventListener("pointerup", onPointerUp, true);
      activeDocument.addEventListener("pointercancel", onPointerUp, true);
    } else {
      activeDocument.addEventListener("mousedown", onMouseDown, true);
      activeDocument.addEventListener("mouseup", onMouseUp, true);
    }

    return () => {
      magnetObserver.disconnect();
      clearMagnet();
      if (supportsPointerEvents) {
        activeDocument.removeEventListener("pointermove", onPointerMove, true);
        activeDocument.removeEventListener("pointerdown", onPointerDown, true);
        activeDocument.removeEventListener("pointerup", onPointerUp, true);
        activeDocument.removeEventListener("pointercancel", onPointerUp, true);
      } else {
        activeDocument.removeEventListener("mousemove", onMouseMove, true);
        activeDocument.removeEventListener("mousedown", onMouseDown, true);
        activeDocument.removeEventListener("mouseup", onMouseUp, true);
      }
      cancelAnimationFrame(rafId);
    };
  }, [isCursorEnabled, targetDocument]);

  if (!isCursorEnabled) {
    return null;
  }

  return <div ref={cursorRef} className="custom-cursor pointer-events-none" />;
}
