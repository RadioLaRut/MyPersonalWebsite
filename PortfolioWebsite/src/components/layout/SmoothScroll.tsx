"use client";
import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    const desktopPointer = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (
      !desktopPointer.matches ||
      reducedMotion.matches
    ) {
      document.documentElement.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-scrolling",
        "lenis-stopped",
      );
      document.body.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-scrolling",
        "lenis-stopped",
      );
      return;
    }

    let destroyed = false;
    let lenis: import("lenis").default | null = null;
    let activationRafId = 0;
    let rafId = 0;

    const removeLenisClasses = () => {
      document.documentElement.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-scrolling",
        "lenis-stopped",
      );
      document.body.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-scrolling",
        "lenis-stopped",
      );
    };
    const runFrame = (time: number) => {
      lenis?.raf(time);
      rafId = requestAnimationFrame(runFrame);
    };
    const startFrames = () => {
      if (rafId || document.hidden || !lenis) return;
      lenis.start();
      rafId = requestAnimationFrame(runFrame);
    };
    const stopFrames = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lenis?.stop();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) stopFrames();
      else startFrames();
    };
    const activate = async () => {
      const { default: Lenis } = await import("lenis");
      if (destroyed) return;

      lenis = new Lenis({
        duration: 1.2,
        easing: (value: number) =>
          Math.min(1, 1.001 - Math.pow(2, -10 * value)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        // Lenis 兼容层仍接受旧配置键；运行时行为与现有站点保持一致。
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      startFrames();
    };

    // 两帧后再加载，确保首屏 HTML、CSS 与首张媒体先进入浏览器管线。
    activationRafId = requestAnimationFrame(() => {
      activationRafId = requestAnimationFrame(() => {
        void activate();
      });
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(activationRafId);
      stopFrames();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      lenis?.destroy();
      removeLenisClasses();
    };
  }, []);

  return null;
}
