import type {
  FontLabDocument,
  FontLabSizeConfig,
} from "./font-lab-config-schema.ts";
import {
  getTypographyFontLabSizes,
  resolveTypographyFontLabSize,
  type TypographyPreset,
  type TypographySize,
} from "./typography-tokens.ts";

export type FontLabSampleLayoutState = {
  showBaseline: boolean;
  showGrid: boolean;
  showLeftEdge: boolean;
  showOpticalAlignment: boolean;
  showRunHighlight: boolean;
};

export const DEFAULT_FONT_LAB_SAMPLE_LAYOUT_STATE: FontLabSampleLayoutState = {
  showBaseline: true,
  showGrid: false,
  showLeftEdge: true,
  showOpticalAlignment: true,
  showRunHighlight: false,
};

export function createDefaultFontLabSampleLayoutState(): FontLabSampleLayoutState {
  return { ...DEFAULT_FONT_LAB_SAMPLE_LAYOUT_STATE };
}

export function resolveFontLabSelection(
  document: FontLabDocument,
  preset: TypographyPreset,
  size: TypographySize,
) {
  const supportedSizes = getTypographyFontLabSizes(preset);

  return {
    activePreset: preset,
    activeSize: supportedSizes.includes(size)
      ? size
      : resolveTypographyFontLabSize(preset, size),
  };
}

export function updateFontLabSelection(
  document: FontLabDocument,
  preset: TypographyPreset,
  size: TypographySize,
): FontLabDocument {
  const selection = resolveFontLabSelection(document, preset, size);

  return {
    ...document,
    activePreset: selection.activePreset,
    activeSize: selection.activeSize,
  };
}

export function getFontLabActiveSizeConfig(
  document: FontLabDocument,
  preset = document.activePreset,
  size = document.activeSize,
): FontLabSizeConfig {
  const selection = resolveFontLabSelection(document, preset, size);
  return document.presets[selection.activePreset].sizes[
    selection.activeSize
  ] as FontLabSizeConfig;
}

export function updateFontLabActiveSizeConfig(
  document: FontLabDocument,
  preset: TypographyPreset,
  size: TypographySize,
  patch: Partial<FontLabSizeConfig>,
): FontLabDocument {
  const selection = resolveFontLabSelection(document, preset, size);
  const currentSizeConfig = document.presets[selection.activePreset].sizes[
    selection.activeSize
  ] as FontLabSizeConfig;

  return {
    ...document,
    activePreset: selection.activePreset,
    activeSize: selection.activeSize,
    presets: {
      ...document.presets,
      [selection.activePreset]: {
        ...document.presets[selection.activePreset],
        sizes: {
          ...document.presets[selection.activePreset].sizes,
          [selection.activeSize]: {
            ...currentSizeConfig,
            ...patch,
          },
        },
      },
    },
  };
}

export function updateFontLabPresetWeightOffset(
  document: FontLabDocument,
  preset: TypographyPreset,
  latinWeightOffsetSteps: number,
): FontLabDocument {
  return {
    ...document,
    presets: {
      ...document.presets,
      [preset]: {
        ...document.presets[preset],
        latinWeightOffsetSteps,
      },
    },
  };
}
