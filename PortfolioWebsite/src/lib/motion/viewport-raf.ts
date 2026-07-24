"use client";

type ViewportWindow = Pick<
  Window,
  | "addEventListener"
  | "cancelAnimationFrame"
  | "removeEventListener"
  | "requestAnimationFrame"
>;

export type ViewportRafBus = {
  subscribe: (listener: () => void) => () => void;
};

export function createViewportRafBus(targetWindow: ViewportWindow): ViewportRafBus {
  const listeners = new Set<() => void>();
  let frameId = 0;

  const flush = () => {
    frameId = 0;
    listeners.forEach((listener) => listener());
  };
  const queue = () => {
    if (frameId !== 0) return;
    frameId = targetWindow.requestAnimationFrame(flush);
  };
  const attach = () => {
    targetWindow.addEventListener("scroll", queue, { passive: true });
    targetWindow.addEventListener("resize", queue);
  };
  const detach = () => {
    targetWindow.removeEventListener("scroll", queue);
    targetWindow.removeEventListener("resize", queue);
    if (frameId !== 0) {
      targetWindow.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) attach();
      listener();

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) detach();
      };
    },
  };
}

const viewportBuses = new WeakMap<Window, ViewportRafBus>();

export function subscribeViewportRaf(
  targetWindow: Window,
  listener: () => void,
) {
  let bus = viewportBuses.get(targetWindow);
  if (!bus) {
    bus = createViewportRafBus(targetWindow);
    viewportBuses.set(targetWindow, bus);
  }
  return bus.subscribe(listener);
}
