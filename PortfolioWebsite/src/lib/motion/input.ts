"use client";

import { useSyncExternalStore } from "react";

type MediaMatchLike = {
  matches: boolean;
};

type MediaMatcher = (query: string) => MediaMatchLike;

const DESKTOP_LAYOUT_MIN_WIDTH = 1024;

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

function getWindowCapabilitySource(targetWindow?: Window | null): InputCapabilitySource {
  const activeWindow = targetWindow ??
    (typeof window === "undefined" ? null : window);
  if (!activeWindow) {
    return {};
  }

  return {
    hasTouchStart: "ontouchstart" in activeWindow,
    innerWidth: activeWindow.innerWidth,
    matchMedia: activeWindow.matchMedia.bind(activeWindow),
    maxTouchPoints: activeWindow.navigator.maxTouchPoints,
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
  const isSmallScreen = innerWidth > 0 && innerWidth < DESKTOP_LAYOUT_MIN_WIDTH;
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

export function supportsDesktopCustomCursor(
  source: InputCapabilitySource = getWindowCapabilitySource(),
) {
  const capabilities = resolveInputCapabilities(source);
  const innerWidth = source.innerWidth ?? 0;

  return supportsDesktopCustomCursorFromCapabilities(capabilities, innerWidth);
}

export function supportsDesktopCustomCursorFromCapabilities(
  capabilities: InputCapabilities,
  innerWidth: number,
) {
  return (
    innerWidth >= DESKTOP_LAYOUT_MIN_WIDTH &&
    capabilities.supportsHoverIntent &&
    !capabilities.prefersReducedMotion
  );
}

function addMediaChangeListener(query: MediaQueryList, handler: () => void) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }

  query.addListener(handler);
  return () => query.removeListener(handler);
}

type InputCapabilityStore = {
  getSnapshot: () => InputCapabilities;
  subscribe: (listener: () => void) => () => void;
};

const SERVER_CAPABILITIES = resolveInputCapabilities({});
const inputCapabilityStores = new WeakMap<Window, InputCapabilityStore>();

function areCapabilitiesEqual(
  left: InputCapabilities,
  right: InputCapabilities,
) {
  return (
    left.canHover === right.canHover &&
    left.hasCoarsePointer === right.hasCoarsePointer &&
    left.hasFinePointer === right.hasFinePointer &&
    left.isTouchLike === right.isTouchLike &&
    left.prefersReducedMotion === right.prefersReducedMotion &&
    left.supportsHoverIntent === right.supportsHoverIntent
  );
}

function createInputCapabilityStore(targetWindow: Window): InputCapabilityStore {
  const listeners = new Set<() => void>();
  const queries = [
    targetWindow.matchMedia("(pointer: fine)"),
    targetWindow.matchMedia("(pointer: coarse)"),
    targetWindow.matchMedia("(hover: hover)"),
    targetWindow.matchMedia("(prefers-reduced-motion: reduce)"),
  ];
  let snapshot = resolveInputCapabilities(getWindowCapabilitySource(targetWindow));
  let removeListeners: Array<() => void> = [];

  const update = (force = false) => {
    const nextSnapshot = resolveInputCapabilities(getWindowCapabilitySource(targetWindow));
    if (!force && areCapabilitiesEqual(snapshot, nextSnapshot)) return;
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener());
  };
  const handleResize = () => update(true);

  const attach = () => {
    removeListeners = queries.map((query) => addMediaChangeListener(query, update));
    targetWindow.addEventListener("resize", handleResize);
  };
  const detach = () => {
    removeListeners.forEach((removeListener) => removeListener());
    removeListeners = [];
    targetWindow.removeEventListener("resize", handleResize);
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) {
        attach();
        update();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) detach();
      };
    },
  };
}

function getInputCapabilityStore(targetWindow: Window): InputCapabilityStore {
  const existing = inputCapabilityStores.get(targetWindow);
  if (existing) return existing;

  const store = createInputCapabilityStore(targetWindow);
  inputCapabilityStores.set(targetWindow, store);
  return store;
}

const serverStore: InputCapabilityStore = {
  getSnapshot: () => SERVER_CAPABILITIES,
  subscribe: () => () => undefined,
};

export function useInputCapabilities(targetWindow?: Window | null) {
  const activeWindow = targetWindow ??
    (typeof window === "undefined" ? null : window);
  const store = activeWindow ? getInputCapabilityStore(activeWindow) : serverStore;

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    serverStore.getSnapshot,
  );
}
