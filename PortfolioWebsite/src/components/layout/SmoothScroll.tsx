"use client";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis"; // or import Lenis from "lenis"

import { usePathname } from "next/navigation";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldDisableSmoothScroll =
    pathname?.startsWith("/admin") || pathname?.startsWith("/playground/font-lab");

  useEffect(() => {
    if (shouldDisableSmoothScroll) {
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

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [shouldDisableSmoothScroll]);

  return <>{children}</>;
}
