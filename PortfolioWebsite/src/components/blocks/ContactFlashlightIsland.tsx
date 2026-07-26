"use client";

import { useEffect, useRef } from "react";

export default function ContactFlashlightIsland({
  copyErrorMessage,
  copyLabel,
  copySuccessMessage,
  maskRadius,
  wechat,
}: {
  copyErrorMessage: string;
  copyLabel: string;
  copySuccessMessage: string;
  maskRadius: number;
  wechat: string;
}) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = markerRef.current?.closest<HTMLElement>(
      "[data-contact-flashlight]",
    );
    const reveal = root?.querySelector<HTMLElement>(
      "[data-contact-reveal-layer]",
    );
    const copyButton = root?.querySelector<HTMLButtonElement>(
      "[data-contact-copy]",
    );
    const feedback = copyButton?.querySelector<HTMLElement>(
      "[data-contact-copy-feedback]",
    );
    const liveRegion = root?.querySelector<HTMLElement>(
      "[data-contact-copy-live]",
    );
    if (!root || !reveal) return;

    let resetTimer = 0;
    let frameId = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    const supportsFlashlight = () =>
      window.innerWidth >= 1024 &&
      !window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const updateCapability = () => {
      const enabled = supportsFlashlight();
      reveal.style.webkitMaskImage = enabled
        ? reveal.dataset.maskImage ?? ""
        : "none";
      reveal.style.maskImage = enabled
        ? reveal.dataset.maskImage ?? ""
        : "none";
    };
    const updatePosition = () => {
      frameId = 0;
      const rect = root.getBoundingClientRect();
      const x = Math.min(
        Math.max(pointerX - rect.left, -maskRadius),
        rect.width + maskRadius,
      );
      const y = Math.min(
        Math.max(pointerY - rect.top, -maskRadius),
        rect.height + maskRadius,
      );
      reveal.style.setProperty("--flashlight-x", `${x}px`);
      reveal.style.setProperty("--flashlight-y", `${y}px`);
    };
    const queuePosition = () => {
      if (!supportsFlashlight() || frameId) return;
      frameId = window.requestAnimationFrame(updatePosition);
    };
    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      queuePosition();
    };
    const setCopyFeedback = (message: string) => {
      if (feedback) feedback.textContent = message;
      if (liveRegion) liveRegion.textContent = message === copyLabel ? "" : message;
      window.clearTimeout(resetTimer);
      if (message !== copyLabel) {
        resetTimer = window.setTimeout(
          () => setCopyFeedback(copyLabel),
          3000,
        );
      }
    };
    const handleCopy = async () => {
      if (!wechat || !navigator.clipboard) {
        setCopyFeedback(copyErrorMessage);
        return;
      }
      try {
        await navigator.clipboard.writeText(wechat);
        setCopyFeedback(copySuccessMessage);
      } catch {
        setCopyFeedback(copyErrorMessage);
      }
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reducedMotion) {
      root
        .querySelectorAll<HTMLElement>("[data-contact-enter]")
        .forEach((element) => {
          const delay = Number(element.dataset.contactEnter ?? 0);
          element.animate(
            [
              {
                opacity: 0,
                transform:
                  element.dataset.contactEnter === "0"
                    ? "translateY(20px)"
                    : "translateY(0)",
              },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { delay, duration: 1000, easing: "ease-out", fill: "both" },
          );
        });
    }

    updateCapability();
    queuePosition();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", queuePosition, { passive: true });
    window.addEventListener("resize", updateCapability);
    window.addEventListener("resize", queuePosition);
    copyButton?.addEventListener("click", handleCopy);

    return () => {
      window.clearTimeout(resetTimer);
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", queuePosition);
      window.removeEventListener("resize", updateCapability);
      window.removeEventListener("resize", queuePosition);
      copyButton?.removeEventListener("click", handleCopy);
    };
  }, [
    copyErrorMessage,
    copyLabel,
    copySuccessMessage,
    maskRadius,
    wechat,
  ]);

  return <span ref={markerRef} className="hidden" aria-hidden="true" />;
}
