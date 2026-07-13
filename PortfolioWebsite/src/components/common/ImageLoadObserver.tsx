"use client";

import { useEffect, useRef } from "react";

export default function ImageLoadObserver() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const frame = markerRef.current?.closest<HTMLElement>(".preset-image-frame");
    const image = frame?.querySelector<HTMLImageElement>("img");
    if (!frame || !image) return;

    const markLoaded = () => {
      frame.dataset.imageState = "loaded";
    };
    const markError = () => {
      frame.dataset.imageState = "error";
    };

    if (image.complete) {
      if (image.naturalWidth > 0) markLoaded();
      else markError();
      return;
    }

    image.addEventListener("load", markLoaded);
    image.addEventListener("error", markError);
    return () => {
      image.removeEventListener("load", markLoaded);
      image.removeEventListener("error", markError);
    };
  }, []);

  return <span ref={markerRef} className="hidden" aria-hidden="true" />;
}
