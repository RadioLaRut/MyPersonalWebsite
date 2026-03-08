export type ImagePreset = "ratio-16-9" | "ratio-21-9" | "native";
export type ImageFitMode = "x" | "y" | "cover";

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
  if (preset === "ratio-21-9") {
    return "relative w-full aspect-[21/9] overflow-hidden bg-black";
  }

  if (preset === "native") {
    return "relative w-full bg-black";
  }

  return "relative w-full aspect-video overflow-hidden bg-black";
}

export function getImageCanvasClassName(preset: ImagePreset, lockFrame = true) {
  if (!lockFrame) {
    return "absolute inset-0 flex items-center justify-center overflow-hidden bg-black";
  }

  if (preset === "native") {
    return "w-full";
  }

  return "absolute inset-0 flex items-center justify-center overflow-hidden bg-black";
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

