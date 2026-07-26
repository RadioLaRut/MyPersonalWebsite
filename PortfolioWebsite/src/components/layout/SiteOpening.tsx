"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePathname } from "next/navigation";

import Typography from "@/components/common/Typography";
import {
  prioritizePageImage,
  selectCriticalPageImage,
  waitForPageImage,
  warmPageImages,
} from "@/lib/page-image-warmup";
import { motionDurations } from "@/lib/motion/tokens";
import { PUBLIC_COPY } from "@/lib/public-copy";
import styles from "./SiteOpening.module.css";

type SiteOpeningProps = {
  rootId: string;
};

type SiteOpeningState = "complete" | "hidden" | "leaving" | "loading";

type OpeningStyle = CSSProperties & Record<`--${string}`, string>;

const CRITICAL_IMAGE_TIMEOUT_MS = 2_500;
const OPENING_STYLE: OpeningStyle = {
  "--site-opening-complete-duration": `${motionDurations.fast}s`,
  "--site-opening-exit-duration": `${motionDurations.slow}s`,
  "--site-opening-scan-duration": `${motionDurations.deliberate}s`,
};

function waitForDuration(durationMs: number, signal: AbortSignal) {
  if (signal.aborted) return Promise.resolve(false);

  return new Promise<boolean>((resolve) => {
    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      resolve(false);
    };
    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve(true);
    }, durationMs);

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

function lockPageScroll() {
  const html = document.documentElement;
  const body = document.body;
  const previousHtmlOverflow = html.style.overflow;
  const previousBodyOverflow = body.style.overflow;
  let restored = false;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  return () => {
    if (restored) return;
    restored = true;
    html.style.overflow = previousHtmlOverflow;
    body.style.overflow = previousBodyOverflow;
  };
}

function getPublicPageImages(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLImageElement>("img"));
}

export function SiteOpening({ rootId }: SiteOpeningProps) {
  const pathname = usePathname();
  const hasCompletedOpeningRef = useRef(false);
  const [state, setState] = useState<SiteOpeningState>("loading");

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const controller = new AbortController();
    const { signal } = controller;
    const isInitialOpening = !hasCompletedOpeningRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const restoreScroll = isInitialOpening ? lockPageScroll() : () => {};

    if (isInitialOpening) {
      setState("loading");
      root.dataset.siteOpeningState = "loading";
    }

    const finishOpening = async () => {
      if (signal.aborted) return;

      setState("complete");
      root.dataset.siteOpeningState = "complete";
      const completed = await waitForDuration(
        reducedMotion ? 0 : motionDurations.fast * 1_000,
        signal,
      );
      if (!completed || signal.aborted) return;

      setState("leaving");
      root.dataset.siteOpeningState = "revealing";
      const revealed = await waitForDuration(
        reducedMotion ? 0 : motionDurations.slow * 1_000,
        signal,
      );
      if (!revealed || signal.aborted) return;

      hasCompletedOpeningRef.current = true;
      root.dataset.siteOpeningState = "ready";
      setState("hidden");
      restoreScroll();
    };

    const startWarmup = (
      criticalImage: HTMLImageElement | null,
    ) => {
      const currentImages = getPublicPageImages(root);
      void warmPageImages(currentImages, {
        concurrency: 3,
        criticalImage,
        signal,
      });
    };

    const run = async () => {
      const images = getPublicPageImages(root);
      const criticalImage = selectCriticalPageImage(
        images,
        window.innerHeight,
      );

      if (criticalImage) {
        prioritizePageImage(criticalImage, "high");
      }

      if (!isInitialOpening) {
        if (criticalImage) {
          await waitForPageImage(criticalImage, {
            signal,
            timeoutMs: CRITICAL_IMAGE_TIMEOUT_MS,
          });
        }
        if (!signal.aborted) startWarmup(criticalImage);
        return;
      }

      const minimumDuration = reducedMotion
        ? motionDurations.fast
        : motionDurations.standard;
      await Promise.all([
        criticalImage
          ? waitForPageImage(criticalImage, {
            signal,
            timeoutMs: CRITICAL_IMAGE_TIMEOUT_MS,
          })
          : Promise.resolve("loaded"),
        waitForDuration(minimumDuration * 1_000, signal),
      ]);
      if (signal.aborted) return;

      startWarmup(criticalImage);
      await finishOpening();
    };

    void run().catch(() => {
      if (!signal.aborted && isInitialOpening) {
        void finishOpening();
      }
    });

    return () => {
      controller.abort();
      restoreScroll();
    };
  }, [pathname, rootId]);

  if (state === "hidden") return null;

  return (
    <div
      aria-busy="true"
      aria-label={PUBLIC_COPY.opening.statusLabel}
      aria-live="polite"
      className={styles.root}
      data-site-opening-overlay=""
      data-state={state}
      role="status"
      style={OPENING_STYLE}
    >
      <div className={`grid-container ${styles.grid}`} aria-hidden="true">
        <div className={styles.lockup}>
          <Typography
            as="p"
            align="right"
            className={styles.brand}
            preset="luna-editorial"
            size="title-sm"
            weight="semantic"
            wrapPolicy="heading"
          >
            {PUBLIC_COPY.opening.title}
          </Typography>
          <span className={styles.track}>
            <span className={styles.progress} />
          </span>
          <Typography
            as="span"
            align="right"
            className={styles.status}
            preset="sans-body"
            size="caption"
            weight="semantic"
            wrapPolicy="label"
          >
            {PUBLIC_COPY.opening.status}
          </Typography>
        </div>
      </div>
    </div>
  );
}
