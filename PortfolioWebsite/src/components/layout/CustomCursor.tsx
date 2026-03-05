"use client";
import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type CustomCursorProps = {
  isWithinIframe?: boolean;
  targetDocument?: Document;
};

export default function CustomCursor({ isWithinIframe, targetDocument }: CustomCursorProps = {}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Disable outer custom cursor in the admin dashboard completely
    if (!isWithinIframe && pathname?.startsWith("/admin")) {
      document.documentElement.setAttribute("data-admin-mode", "true");
      return;
    }

    if (!isWithinIframe) {
      document.documentElement.removeAttribute("data-admin-mode");
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    const win = targetDocument?.defaultView || window;
    let rafId: number;
    // Mouse coords updated by event listener
    let mouseX = win.innerWidth / 2;
    let mouseY = win.innerHeight / 2;
    // Current rendered coords (for smoothing if desired, but here we just follow directly)
    let currentX = mouseX;
    let currentY = mouseY;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Also check the target under mouse for classes
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
      // Direct absolute position
      currentX += (mouseX - currentX) * 0.2;
      currentY += (mouseY - currentY) * 0.2;

      if (cursor) {
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(updateCursor);
    };

    win.addEventListener("mousemove", onMouseMove);
    updateCursor();

    const onMouseDown = () => {
      if (cursor)
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(0.8)`;
    };
    const onMouseUp = () => {
      if (cursor)
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(1)`;
    };

    win.addEventListener("mousedown", onMouseDown);
    win.addEventListener("mouseup", onMouseUp);

    return () => {
      win.removeEventListener("mousemove", onMouseMove);
      win.removeEventListener("mousedown", onMouseDown);
      win.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, [pathname, isWithinIframe, targetDocument]);

  if (!isWithinIframe && pathname?.startsWith("/admin")) {
    return null;
  }

  return <div ref={cursorRef} className="custom-cursor pointer-events-none" />;
}
