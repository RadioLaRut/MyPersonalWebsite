"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const CustomCursor = lazy(() => import("./CustomCursor"));
const ImageLoadCoordinator = lazy(() => import("./ImageLoadCoordinator"));
const SmoothScroll = lazy(() => import("./SmoothScroll"));
const PublicMotionRuntime = lazy(
  () => import("@/components/motion/PublicMotionRuntime"),
);

export default function DeferredPublicRuntime() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <CustomCursor />
      <ImageLoadCoordinator />
      <SmoothScroll />
      <PublicMotionRuntime />
    </Suspense>
  );
}
