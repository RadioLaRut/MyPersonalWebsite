import {
  type ImageFitMode,
  type ImagePreset,
  IMAGE_FIT_MODE_OPTIONS,
  IMAGE_PRESET_OPTIONS,
  normalizeImageFitMode,
  normalizeImagePreset,
} from "../../lib/image-presentation.ts";

/**
 * 图片预设字段配置
 */
export const imagePresetField = {
  type: "select" as const,
  options: IMAGE_PRESET_OPTIONS.map((option) => ({ ...option })),
};

/**
 * 图片适配模式字段配置
 */
export const imageFitModeField = {
  type: "select" as const,
  options: IMAGE_FIT_MODE_OPTIONS.map((option) => ({ ...option })),
};

export function castImagePreset(value: unknown): ImagePreset {
  return normalizeImagePreset(typeof value === "string" ? value : null);
}

export function castImageFitMode(value: unknown): ImageFitMode {
  return normalizeImageFitMode(typeof value === "string" ? value : null);
}

export type ImageFieldTripleOptions = {
  defaultFitMode?: ImageFitMode;
  defaultPreset?: ImagePreset;
  defaultSrc?: string;
  fitModeKey?: string;
  fitModeLabel?: string;
  presetKey?: string;
  presetLabel?: string;
  srcLabel?: string;
};

function deriveImagePresetKey(srcKey: string) {
  if (srcKey.endsWith("Src")) {
    return `${srcKey.slice(0, -"Src".length)}Preset`;
  }
  if (srcKey.endsWith("Image")) {
    return `${srcKey}Preset`;
  }
  if (srcKey === "src") {
    return "preset";
  }
  return "imagePreset";
}

function deriveImageFitModeKey(srcKey: string) {
  if (srcKey.endsWith("Src")) {
    return `${srcKey.slice(0, -"Src".length)}FitMode`;
  }
  if (srcKey.endsWith("Image")) {
    return `${srcKey}FitMode`;
  }
  if (srcKey === "src") {
    return "fitMode";
  }
  return "imageFitMode";
}

export function buildImageFieldTriple(srcKey: string, options: ImageFieldTripleOptions = {}) {
  const {
    defaultFitMode = "x",
    defaultPreset = "ratio-16-9",
    defaultSrc = "",
    fitModeKey = deriveImageFitModeKey(srcKey),
    fitModeLabel = "Image Fit Mode",
    presetKey = deriveImagePresetKey(srcKey),
    presetLabel = "Image Preset",
    srcLabel = "Image Source",
  } = options;

  return {
    defaults: {
      [srcKey]: defaultSrc,
      [presetKey]: defaultPreset,
      [fitModeKey]: defaultFitMode,
    },
    fields: {
      [srcKey]: { type: "text", label: srcLabel },
      [presetKey]: { ...imagePresetField, label: presetLabel },
      [fitModeKey]: { ...imageFitModeField, label: fitModeLabel },
    },
  };
}
