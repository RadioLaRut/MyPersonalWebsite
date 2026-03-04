"use client";
import React, { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let rafId: number;
    // Mouse coords updated by event listener
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    // Current rendered coords (for smoothing if desired, but here we just follow directly)
    let currentX = mouseX;
    let currentY = mouseY;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Also check the target under mouse for classes
      const target = e.target as HTMLElement;

      const isInteractive = target.closest(
        "a, button, input, [role='button'], .interactive",
      );
      const isText = target.closest(".hover-text");

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

    window.addEventListener("mousemove", onMouseMove);
    updateCursor();

    const onMouseDown = () => {
      if (cursor)
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(0.8)`;
    };
    const onMouseUp = () => {
      if (cursor)
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(1)`;
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor pointer-events-none" />;
}
