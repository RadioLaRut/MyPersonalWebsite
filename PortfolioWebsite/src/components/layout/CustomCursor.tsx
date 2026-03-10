"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type CustomCursorProps = {
  isWithinIframe?: boolean;
  targetDocument?: Document;
};

export default function CustomCursor({ isWithinIframe, targetDocument }: CustomCursorProps = {}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isCursorEnabled, setIsCursorEnabled] = useState(false);
  const [isAdminShell, setIsAdminShell] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const activeDocument = targetDocument ?? document;
    const htmlElement = activeDocument.documentElement;
    const currentPathname = isWithinIframe
      ? targetDocument?.defaultView?.location.pathname ?? ""
      : pathname ?? "";
    const adminShell = !isWithinIframe && currentPathname.startsWith("/admin");
    setIsAdminShell(adminShell);

    // Disable outer custom cursor in the admin dashboard completely
    if (adminShell) {
      htmlElement.setAttribute("data-admin-mode", "true");
      setIsCursorEnabled(false);
      return () => {
        htmlElement.removeAttribute("data-admin-mode");
      };
    }

    if (!isWithinIframe) {
      htmlElement.removeAttribute("data-admin-mode");
    }

    const win = targetDocument?.defaultView || window;
    const pointerQuery = win.matchMedia("(pointer: fine)");
    const reducedMotionQuery = win.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCursorAvailability = () => {
      setIsCursorEnabled(pointerQuery.matches && !reducedMotionQuery.matches);
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
    const removeMotionListener = addMediaListener(reducedMotionQuery, updateCursorAvailability);

    return () => {
      removePointerListener();
      removeMotionListener();
    };
  }, [isWithinIframe, pathname, targetDocument]);

  useEffect(() => {
    if (!isCursorEnabled) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) {
      return;
    }

    const win = targetDocument?.defaultView || window;
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

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const target = e.target as Element;

      const isInteractive = target?.closest?.(
        "a, button, input, [role='button'], .interactive",
      );
      const isText = target?.closest?.(".hover-text");
      const magnetElements = Array.from(
        (targetDocument ?? document).querySelectorAll<HTMLElement>("[data-cursor-magnet]"),
      );
      let nearestMagnet: HTMLElement | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const magnetElement of magnetElements) {
        const rect = magnetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(centerX - e.clientX, centerY - e.clientY);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestMagnet = magnetElement;
        }
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

    const updateCursor = () => {
      const targetX = mouseX + (magnetX - mouseX) * magnetStrength;
      const targetY = mouseY + (magnetY - mouseY) * magnetStrength;

      // Tight lerp, no bounce. Weakened presence.
      currentX += (targetX - currentX) * 0.6;
      currentY += (targetY - currentY) * 0.6;

      if (cursor) {
        const scale = isPressed ? 0.85 : 1;
        cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%) scale(${scale})`;
      }
      rafId = requestAnimationFrame(updateCursor);
    };

    win.addEventListener("mousemove", onMouseMove);
    updateCursor();

    const onMouseDown = () => {
      isPressed = true;
    };
    const onMouseUp = () => {
      isPressed = false;
    };

    win.addEventListener("mousedown", onMouseDown);
    win.addEventListener("mouseup", onMouseUp);

    return () => {
      clearMagnet();
      win.removeEventListener("mousemove", onMouseMove);
      win.removeEventListener("mousedown", onMouseDown);
      win.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, [isCursorEnabled, targetDocument]);

  if (isAdminShell) {
    return null;
  }

  if (!isCursorEnabled) {
    return null;
  }

  return <div ref={cursorRef} className="custom-cursor pointer-events-none" />;
}
