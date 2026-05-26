"use client";

import { useEffect, useState } from "react";

type MediaMatchLike = {
  matches: boolean;
};

type MediaMatcher = (query: string) => MediaMatchLike;

export type InputCapabilitySource = {
  hasTouchStart?: boolean;
  innerWidth?: number;
  matchMedia?: MediaMatcher;
  maxTouchPoints?: number;
};

export type InputCapabilities = {
  canHover: boolean;
  hasCoarsePointer: boolean;
  hasFinePointer: boolean;
  isTouchLike: boolean;
  prefersReducedMotion: boolean;
  supportsHoverIntent: boolean;
};

function queryMatches(matchMedia: MediaMatcher | undefined, query: string) {
  return Boolean(matchMedia?.(query).matches);
}

function getWindowCapabilitySource(): InputCapabilitySource {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    hasTouchStart: "ontouchstart" in window,
    innerWidth: window.innerWidth,
    matchMedia: window.matchMedia.bind(window),
    maxTouchPoints: navigator.maxTouchPoints,
  };
}

export function resolveInputCapabilities(
  source: InputCapabilitySource = getWindowCapabilitySource(),
): InputCapabilities {
  const hasFinePointer = queryMatches(source.matchMedia, "(pointer: fine)");
  const hasCoarsePointer = queryMatches(source.matchMedia, "(pointer: coarse)");
  const canHover = queryMatches(source.matchMedia, "(hover: hover)");
  const prefersReducedMotion = queryMatches(
    source.matchMedia,
    "(prefers-reduced-motion: reduce)",
  );
  const maxTouchPoints = source.maxTouchPoints ?? 0;
  const innerWidth = source.innerWidth ?? 0;
  const hasTouchInput = Boolean(source.hasTouchStart) || maxTouchPoints > 0 || hasCoarsePointer;
  const isSmallScreen = innerWidth > 0 && innerWidth < 1024;
  const isTouchLike = hasTouchInput && (!hasFinePointer || isSmallScreen || !canHover);
  const supportsHoverIntent = hasFinePointer && canHover && !isTouchLike;

  return {
    canHover,
    hasCoarsePointer,
    hasFinePointer,
    isTouchLike,
    prefersReducedMotion,
    supportsHoverIntent,
  };
}

function addMediaChangeListener(query: MediaQueryList, handler: () => void) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }

  query.addListener(handler);
  return () => query.removeListener(handler);
}

export function useInputCapabilities() {
  const [capabilities, setCapabilities] = useState<InputCapabilities>(() =>
    resolveInputCapabilities(),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const queries = [
      window.matchMedia("(pointer: fine)"),
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(hover: hover)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];
    const update = () => setCapabilities(resolveInputCapabilities());

    update();
    const removeListeners = queries.map((query) => addMediaChangeListener(query, update));
    window.addEventListener("resize", update);

    return () => {
      removeListeners.forEach((removeListener) => removeListener());
      window.removeEventListener("resize", update);
    };
  }, []);

  return capabilities;
}
