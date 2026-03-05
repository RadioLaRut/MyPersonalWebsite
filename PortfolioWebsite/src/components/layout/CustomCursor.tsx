"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type CustomCursorProps = {
  isWithinIframe?: boolean;
  targetDocument?: Document;
};

export default function CustomCursor({ isWithinIframe, targetDocument }: CustomCursorProps = {}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isCursorEnabled, setIsCursorEnabled] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;

    // Disable outer custom cursor in the admin dashboard completely
    if (!isWithinIframe && pathname?.startsWith("/admin")) {
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
  }, [pathname, isWithinIframe, targetDocument]);

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
    let isPressed = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const target = e.target as Element;

      const isInteractive = target?.closest?.(
        "a, button, input, [role='button'], .interactive",
      );
      const isText = target?.closest?.(".hover-text");

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
      currentX += (mouseX - currentX) * 0.2;
      currentY += (mouseY - currentY) * 0.2;

      if (cursor) {
        const scale = isPressed ? 0.8 : 1;
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
      win.removeEventListener("mousemove", onMouseMove);
      win.removeEventListener("mousedown", onMouseDown);
      win.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, [isCursorEnabled, targetDocument]);

  if (!isWithinIframe && pathname?.startsWith("/admin")) {
    return null;
  }

  if (!isCursorEnabled) {
    return null;
  }

  return <div ref={cursorRef} className="custom-cursor pointer-events-none" />;
}
