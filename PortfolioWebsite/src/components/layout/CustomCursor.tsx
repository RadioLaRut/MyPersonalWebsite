"use client";
import React, { useEffect, useRef } from "react";
import {
  subscribeViewportRaf,
  supportsDesktopCustomCursorFromCapabilities,
  useInputCapabilities,
} from "@/lib/motion";

type CustomCursorProps = {
  targetDocument?: Document;
};

const CUSTOM_CURSOR_ACTIVE_ATTRIBUTE = "data-custom-cursor-active";

export default function CustomCursor({ targetDocument }: CustomCursorProps = {}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const activeWindow = targetDocument?.defaultView ??
    (typeof window === "undefined" ? null : window);
  const inputCapabilities = useInputCapabilities(activeWindow);
  const isCursorEnabled = activeWindow
    ? supportsDesktopCustomCursorFromCapabilities(
      inputCapabilities,
      activeWindow.innerWidth,
    )
    : false;

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
    const win = activeWindow;
    if (!win) return;
    let magnetElements = Array.from(
      activeDocument.querySelectorAll<HTMLElement>("[data-cursor-magnet]"),
    );
    let magnetRects: Array<{ element: HTMLElement; rect: DOMRect }> = [];
    let rafId = 0;
    let mouseX = win.innerWidth / 2;
    let mouseY = win.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let magnetX = mouseX;
    let magnetY = mouseY;
    let magnetStrength = 0;
    let isPressed = false;
    let activeMagnet: HTMLElement | null = null;
    let pointerTarget: EventTarget | null = null;
    let pointerDirty = true;
    let magnetElementsDirty = true;
    let magnetRectsDirty = true;
    let magnetResizeObserver: ResizeObserver | null = null;

    const clearMagnet = () => {
      magnetStrength = 0;
      cursor.classList.remove("cursor-magnetized");
      cursor.style.removeProperty("--cursor-magnet-size");
      if (activeMagnet) {
        activeMagnet.removeAttribute("data-cursor-magnet-active");
        activeMagnet = null;
      }
    };

    const refreshMagnetRects = () => {
      if (magnetElementsDirty) {
        magnetElements = Array.from(
          activeDocument.querySelectorAll<HTMLElement>("[data-cursor-magnet]"),
        );
        magnetResizeObserver?.disconnect();
        for (const element of magnetElements) {
          magnetResizeObserver?.observe(element);
        }
        magnetElementsDirty = false;
      }
      magnetRects = magnetElements
        .filter((element) => (
          element.isConnected && element.matches("[data-cursor-magnet]")
        ))
        .map((element) => ({ element, rect: element.getBoundingClientRect() }));
      magnetRectsDirty = false;
      if (
        activeMagnet &&
        (!activeMagnet.isConnected || !activeMagnet.matches("[data-cursor-magnet]"))
      ) {
        clearMagnet();
      }
    };

    const evaluatePointerTarget = () => {
      if (magnetElementsDirty || magnetRectsDirty) {
        refreshMagnetRects();
      }
      const target = pointerTarget as Element | null;

      const isInteractive = target?.closest?.(
        "a, button, input, [role='button'], .interactive",
      );
      const isText = target?.closest?.(".hover-text");
      let nearestMagnet: { element: HTMLElement; rect: DOMRect } | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      if (magnetRects.length > 0) {
        for (const magnet of magnetRects) {
          const rect = magnet.rect;
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.hypot(centerX - mouseX, centerY - mouseY);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestMagnet = magnet;
          }
        }
      } else {
        clearMagnet();
      }

      if (nearestMagnet && nearestDistance < 34) {
        const { element, rect } = nearestMagnet;
        magnetX = rect.left + rect.width / 2;
        magnetY = rect.top + rect.height / 2;
        magnetStrength = 0.42 + (1 - nearestDistance / 34) * 0.38;
        cursor.classList.add("cursor-magnetized");
        cursor.style.setProperty(
          "--cursor-magnet-size",
          `${element.dataset.cursorMagnetSize ?? Math.max(rect.width, rect.height)}px`,
        );

        if (activeMagnet !== element) {
          if (activeMagnet) {
            activeMagnet.removeAttribute("data-cursor-magnet-active");
          }
          activeMagnet = element;
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
      pointerDirty = false;
    };

    const recordPointerTarget = (
      clientX: number,
      clientY: number,
      eventTarget: EventTarget | null,
    ) => {
      mouseX = clientX;
      mouseY = clientY;
      pointerTarget = eventTarget;
      pointerDirty = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      recordPointerTarget(event.clientX, event.clientY, event.target);
    };

    const onMouseMove = (event: MouseEvent) => {
      recordPointerTarget(event.clientX, event.clientY, event.target);
    };

    const updateCursor = () => {
      if (pointerDirty || magnetElementsDirty || magnetRectsDirty) {
        evaluatePointerTarget();
      }
      const targetX = mouseX + (magnetX - mouseX) * magnetStrength;
      const targetY = mouseY + (magnetY - mouseY) * magnetStrength;

      // Tight lerp, no bounce. Weakened presence.
      currentX += (targetX - currentX) * 0.6;
      currentY += (targetY - currentY) * 0.6;

      if (cursor) {
        const scale = isPressed ? 0.85 : 1;
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      rafId = win.requestAnimationFrame(updateCursor);
    };

    const magnetRoot = activeDocument.body ?? activeDocument.documentElement;
    const markMagnetElementsDirty = () => {
      magnetElementsDirty = true;
      magnetRectsDirty = true;
      pointerDirty = true;
    };
    const markMagnetRectsDirty = () => {
      magnetRectsDirty = true;
      pointerDirty = true;
    };
    magnetResizeObserver = typeof win.ResizeObserver === "function"
      ? new win.ResizeObserver(markMagnetRectsDirty)
      : null;
    const magnetObserver = new win.MutationObserver(markMagnetElementsDirty);
    magnetObserver.observe(magnetRoot, {
      attributeFilter: ["data-cursor-magnet"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    const unsubscribeViewport = subscribeViewportRaf(win, markMagnetRectsDirty);

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
      magnetResizeObserver?.disconnect();
      unsubscribeViewport();
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
      win.cancelAnimationFrame(rafId);
    };
  }, [activeWindow, isCursorEnabled, targetDocument]);

  if (!isCursorEnabled) {
    return null;
  }

  return <div ref={cursorRef} className="custom-cursor pointer-events-none" />;
}
