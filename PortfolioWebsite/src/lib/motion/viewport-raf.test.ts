import assert from "node:assert/strict";
import test from "node:test";

import { createViewportRafBus } from "./viewport-raf.ts";

test("viewport bus shares one scroll/resize listener pair and coalesces events into one RAF", () => {
  const eventListeners = new Map<string, Set<() => void>>();
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrameId = 1;
  const targetWindow = {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
      const callbacks = eventListeners.get(type) ?? new Set();
      callbacks.add(listener as () => void);
      eventListeners.set(type, callbacks);
    },
    cancelAnimationFrame(frameId: number) {
      frames.delete(frameId);
    },
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
      eventListeners.get(type)?.delete(listener as () => void);
    },
    requestAnimationFrame(callback: FrameRequestCallback) {
      const frameId = nextFrameId;
      nextFrameId += 1;
      frames.set(frameId, callback);
      return frameId;
    },
  };
  const bus = createViewportRafBus(targetWindow as unknown as Window);
  let notifications = 0;
  const unsubscribeOne = bus.subscribe(() => {
    notifications += 1;
  });
  const unsubscribeTwo = bus.subscribe(() => {
    notifications += 1;
  });

  assert.equal(eventListeners.get("scroll")?.size, 1);
  assert.equal(eventListeners.get("resize")?.size, 1);
  eventListeners.get("scroll")?.forEach((listener) => listener());
  eventListeners.get("resize")?.forEach((listener) => listener());
  assert.equal(frames.size, 1);
  const [[frameId, frame]] = frames;
  frames.delete(frameId);
  frame(0);
  assert.equal(notifications, 4);

  unsubscribeOne();
  unsubscribeTwo();
  assert.equal(eventListeners.get("scroll")?.size, 0);
  assert.equal(eventListeners.get("resize")?.size, 0);
});
