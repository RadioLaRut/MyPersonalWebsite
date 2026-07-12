export type ImagePreset = "ratio-16-9" | "ratio-21-9" | "native";
export type ImageFitMode = "x" | "y" | "cover";
export type ImageBreakpointValue<T> = {
  base?: T;
  md?: T;
  lg?: T;
};
export type ImageObjectPosition = {
  x: number;
  y: number;
};

export const IMAGE_PRESET_OPTIONS = [
  { label: "16:9 固定尺寸", value: "ratio-16-9" },
  { label: "21:9 固定尺寸", value: "ratio-21-9" },
  { label: "原始比例", value: "native" },
] as const;

export const IMAGE_FIT_MODE_OPTIONS = [
  { label: "X 对齐", value: "x" },
  { label: "Y 对齐", value: "y" },
  { label: "Cover", value: "cover" },
] as const;

export function normalizeImagePreset(value?: string | null): ImagePreset {
  if (value === "ratio-21-9" || value === "native") {
    return value;
  }
  return "ratio-16-9";
}

export function normalizeImageFitMode(value?: string | null): ImageFitMode {
  if (value === "y" || value === "cover") {
    return value;
  }
  return "x";
}

export function getImagePresetFrameClassName(preset: ImagePreset) {
  const baseClasses = "relative w-full overflow-hidden bg-black";

  if (preset === "ratio-21-9") {
    return `${baseClasses} aspect-[21/9]`;
  }
  if (preset === "native") {
    return baseClasses;
  }
  return `${baseClasses} aspect-video`;
}

export function getImageCanvasClassName(preset: ImagePreset, lockFrame = true) {
  if (!lockFrame || preset !== "native") {
    return "absolute inset-0 flex items-center justify-center overflow-hidden bg-black";
  }
  return "w-full";
}

export function getImageElementClassName(preset: ImagePreset, fitMode: ImageFitMode) {
  if (preset === "native") {
    return "block w-full h-auto";
  }
  if (fitMode === "y") {
    return "block h-full w-auto max-h-none max-w-none shrink-0";
  }
  if (fitMode === "cover") {
    return "block h-full w-full object-cover";
  }
  return "block w-full h-auto max-h-none max-w-none shrink-0";
}

const RESPONSIVE_FIT_CLASSES = {
  base: {
    x: "block w-full h-auto max-h-none max-w-none shrink-0 object-fill",
    y: "block h-full w-auto max-h-none max-w-none shrink-0 object-fill",
    cover: "block h-full w-full max-h-none max-w-none shrink-0 object-cover",
  },
  md: {
    x: "md:block md:w-full md:h-auto md:max-h-none md:max-w-none md:shrink-0 md:object-fill",
    y: "md:block md:h-full md:w-auto md:max-h-none md:max-w-none md:shrink-0 md:object-fill",
    cover: "md:block md:h-full md:w-full md:max-h-none md:max-w-none md:shrink-0 md:object-cover",
  },
  lg: {
    x: "lg:block lg:w-full lg:h-auto lg:max-h-none lg:max-w-none lg:shrink-0 lg:object-fill",
    y: "lg:block lg:h-full lg:w-auto lg:max-h-none lg:max-w-none lg:shrink-0 lg:object-fill",
    cover: "lg:block lg:h-full lg:w-full lg:max-h-none lg:max-w-none lg:shrink-0 lg:object-cover",
  },
} as const;

export function getResponsiveImageElementClassName(
  preset: ImagePreset,
  fallbackFitMode: ImageFitMode,
  fitModeByBreakpoint?: ImageBreakpointValue<ImageFitMode>,
) {
  if (preset === "native") {
    return getImageElementClassName(preset, "x");
  }

  const base = normalizeImageFitMode(fitModeByBreakpoint?.base ?? fallbackFitMode);
  const md = fitModeByBreakpoint?.md
    ? normalizeImageFitMode(fitModeByBreakpoint.md)
    : null;
  const lg = fitModeByBreakpoint?.lg
    ? normalizeImageFitMode(fitModeByBreakpoint.lg)
    : null;

  return [
    RESPONSIVE_FIT_CLASSES.base[base],
    md ? RESPONSIVE_FIT_CLASSES.md[md] : "",
    lg ? RESPONSIVE_FIT_CLASSES.lg[lg] : "",
    "responsive-preset-image",
  ].filter(Boolean).join(" ");
}

export function isValidImagePresentationCombination(
  preset: ImagePreset,
  fitMode: ImageFitMode,
) {
  return preset !== "native" || fitMode === "x";
}
