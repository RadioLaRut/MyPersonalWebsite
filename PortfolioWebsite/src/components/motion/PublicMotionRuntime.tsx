"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { subscribeViewportRaf } from "@/lib/motion/viewport-raf";

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function projectOpacity(progress: number) {
  if (progress <= 0.32) {
    return 0.34 + (progress / 0.32) * 0.66;
  }
  if (progress <= 0.72) return 1;
  return 1 - ((progress - 0.72) / 0.28) * 0.66;
}

export default function PublicMotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const roots = Array.from(
      document.querySelectorAll<HTMLElement>("[data-public-motion-kind]"),
    ).map((root) => ({
      content: root.querySelector<HTMLElement>("[data-public-motion-content]"),
      kind: root.dataset.publicMotionKind as "hero" | "project",
      media: root.querySelector<HTMLElement>("[data-public-motion-media]"),
      root,
    }));
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const update = () => {
      roots.forEach(({ content, kind, media, root }) => {
        if (!media) return;
        const rect = root.getBoundingClientRect();
        if (kind === "hero") {
          const progress = clamp(-rect.top / Math.max(rect.height, 1));
          media.style.transform =
            `translate3d(0,${progress * 12}%,0) scale(${1 + progress * 0.08})`;
          return;
        }

        const progress = clamp(
          (window.innerHeight - rect.top) /
            Math.max(window.innerHeight + rect.height, 1),
        );
        media.style.transform =
          `translate3d(0,${-8 + progress * 16}%,0) scale(${1.01 + progress * 0.03})`;
        if (content) content.style.opacity = String(projectOpacity(progress));
      });
    };
    const unsubscribe = subscribeViewportRaf(window, update);

    return unsubscribe;
  }, [pathname]);

  return null;
}
