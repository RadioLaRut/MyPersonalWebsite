export type PageImageWaitResult =
  | "aborted"
  | "error"
  | "loaded"
  | "timeout";

export type PageImageWarmupSummary = {
  aborted: number;
  errors: number;
  loaded: number;
  timedOut: number;
  total: number;
};

type PageImageWaitOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

type PageImageWarmupOptions = PageImageWaitOptions & {
  concurrency?: number;
  criticalImage?: HTMLImageElement | null;
};

const DEFAULT_IMAGE_WAIT_TIMEOUT_MS = 15_000;
const MAX_WARMUP_CONCURRENCY = 4;

function hasUsableImageSource(image: HTMLImageElement) {
  return Boolean(image.currentSrc || image.src || image.srcset);
}

function isLoadedImage(image: HTMLImageElement) {
  return image.complete && image.naturalWidth > 0;
}

function createResponsiveImageKey(image: HTMLImageElement) {
  return [
    image.currentSrc || image.src,
    image.srcset,
    image.sizes,
  ].join("|");
}

async function decodeLoadedImage(image: HTMLImageElement) {
  if (typeof image.decode !== "function") return;

  try {
    await image.decode();
  } catch {
    // 某些可正常展示的格式或浏览器实现仍可能拒绝 decode。
    // naturalWidth 是最终是否可用的判断依据。
  }
}

export function selectCriticalPageImage(
  images: Iterable<HTMLImageElement>,
  viewportHeight: number,
): HTMLImageElement | null {
  const candidates = Array.from(images).filter(hasUsableImageSource);
  const explicitlyPrioritized = candidates.find(
    (image) => image.fetchPriority === "high",
  );
  if (explicitlyPrioritized) return explicitlyPrioritized;

  return candidates.find((image) => {
    const rect = image.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < viewportHeight
    );
  }) ?? null;
}

export function prioritizePageImage(
  image: HTMLImageElement,
  priority: "high" | "low",
) {
  image.loading = "eager";
  image.fetchPriority = priority;
}

export function waitForPageImage(
  image: HTMLImageElement,
  {
    signal,
    timeoutMs = DEFAULT_IMAGE_WAIT_TIMEOUT_MS,
  }: PageImageWaitOptions = {},
): Promise<PageImageWaitResult> {
  if (signal?.aborted) return Promise.resolve("aborted");

  return new Promise((resolve) => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      signal?.removeEventListener("abort", handleAbort);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
    const finish = (result: PageImageWaitResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const finishLoaded = async () => {
      if (image.naturalWidth <= 0) {
        finish("error");
        return;
      }

      await decodeLoadedImage(image);
      finish(image.naturalWidth > 0 ? "loaded" : "error");
    };
    function handleLoad() {
      void finishLoaded();
    }
    function handleError() {
      finish("error");
    }
    function handleAbort() {
      finish("aborted");
    }

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    signal?.addEventListener("abort", handleAbort, { once: true });

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => finish("timeout"), timeoutMs);
    }

    if (image.complete) {
      if (image.naturalWidth > 0) {
        void finishLoaded();
      } else {
        finish("error");
      }
    }
  });
}

function getWarmupCandidates(
  images: Iterable<HTMLImageElement>,
  criticalImage?: HTMLImageElement | null,
) {
  const seen = new Set<string>();
  const candidates: HTMLImageElement[] = [];

  for (const image of images) {
    if (
      image === criticalImage ||
      !hasUsableImageSource(image) ||
      isLoadedImage(image)
    ) {
      continue;
    }

    const key = createResponsiveImageKey(image);
    if (seen.has(key)) continue;

    seen.add(key);
    candidates.push(image);
  }

  return candidates;
}

export async function warmPageImages(
  images: Iterable<HTMLImageElement>,
  {
    concurrency = 3,
    criticalImage = null,
    signal,
    timeoutMs = DEFAULT_IMAGE_WAIT_TIMEOUT_MS,
  }: PageImageWarmupOptions = {},
): Promise<PageImageWarmupSummary> {
  const candidates = getWarmupCandidates(images, criticalImage);
  const workerCount = Math.min(
    candidates.length,
    Math.max(
      1,
      Math.min(MAX_WARMUP_CONCURRENCY, Math.floor(concurrency) || 1),
    ),
  );
  const summary: PageImageWarmupSummary = {
    aborted: 0,
    errors: 0,
    loaded: 0,
    timedOut: 0,
    total: candidates.length,
  };
  let nextIndex = 0;

  const runWorker = async () => {
    while (!signal?.aborted) {
      const candidateIndex = nextIndex;
      nextIndex += 1;
      if (candidateIndex >= candidates.length) return;

      const image = candidates[candidateIndex];
      if (image.fetchPriority !== "high") {
        prioritizePageImage(image, "low");
      } else {
        image.loading = "eager";
      }

      const result = await waitForPageImage(image, { signal, timeoutMs });
      if (result === "loaded") summary.loaded += 1;
      if (result === "error") summary.errors += 1;
      if (result === "timeout") summary.timedOut += 1;
      if (result === "aborted") summary.aborted += 1;
    }
  };

  await Promise.all(
    Array.from({ length: workerCount }, () => runWorker()),
  );

  return summary;
}
