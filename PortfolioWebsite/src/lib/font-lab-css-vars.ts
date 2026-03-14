import type { FontLabDocument } from "./font-lab-config-schema.ts";
import {
  getTypographyFontLabSizes,
  getTypographySizeToken,
  resolveTypographyPresetWeightPair,
  TYPOGRAPHY_PRESETS,
  TYPOGRAPHY_WEIGHTS,
} from "./typography-tokens.ts";
import { PREVIEW_REFERENCE_VIEWPORT_PX } from "./preview-viewports.ts";

export type FontLabCssVars = Record<string, string>;

function formatFontSizeNumber(value: number) {
  return `${Number.parseFloat(value.toFixed(4))}`;
}

function parseRemFontSize(value: string) {
  const match = value.trim().match(/^(-?\d*\.?\d+)rem$/i);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseClampFontSize(value: string) {
  const match = value.trim().match(
    /^clamp\(\s*(-?\d*\.?\d+)rem\s*,\s*(-?\d*\.?\d+)vw\s*,\s*(-?\d*\.?\d+)rem\s*\)$/i,
  );

  if (!match) {
    return null;
  }

  const minRem = Number(match[1]);
  const viewportVw = Number(match[2]);
  const maxRem = Number(match[3]);

  if (
    !Number.isFinite(minRem) ||
    !Number.isFinite(viewportVw) ||
    !Number.isFinite(maxRem)
  ) {
    return null;
  }

  return {
    maxRem,
    minRem,
    viewportVw,
  };
}

function getFixedFontSizeRem(value: string) {
  const parsedRem = parseRemFontSize(value);

  if (parsedRem !== null) {
    return parsedRem;
  }

  const parsedClamp = parseClampFontSize(value);

  if (parsedClamp) {
    const preferredRem =
      (parsedClamp.viewportVw * PREVIEW_REFERENCE_VIEWPORT_PX) / 100 / 16;

    return Math.min(Math.max(preferredRem, parsedClamp.minRem), parsedClamp.maxRem);
  }

  return null;
}

function resolveResponsiveFontSize(configuredFixedSize: string, tokenFontSize: string) {
  const configuredRem = getFixedFontSizeRem(configuredFixedSize);

  if (configuredRem === null) {
    return tokenFontSize;
  }

  const tokenClamp = parseClampFontSize(tokenFontSize);

  if (!tokenClamp) {
    return `${formatFontSizeNumber(configuredRem)}rem`;
  }

  const tokenReferenceRem = getFixedFontSizeRem(tokenFontSize);

  if (tokenReferenceRem === null || tokenReferenceRem <= 0) {
    return tokenFontSize;
  }

  const scale = configuredRem / tokenReferenceRem;
  const minRem = tokenClamp.minRem * scale;
  const viewportVw = tokenClamp.viewportVw * scale;
  const maxRem = tokenClamp.maxRem * scale;

  return `clamp(${formatFontSizeNumber(minRem)}rem,${formatFontSizeNumber(viewportVw)}vw,${formatFontSizeNumber(maxRem)}rem)`;
}

export function buildFontLabDocumentCssVars(
  document: FontLabDocument,
): FontLabCssVars {
  const vars: FontLabCssVars = {};

  for (const preset of TYPOGRAPHY_PRESETS) {
    const presetConfig = document.presets[preset];
    vars[`--typography-${preset}-latin-scale`] = String(presetConfig.latinFontScale);

    for (const size of getTypographyFontLabSizes(preset)) {
      const sizeConfig = presetConfig.sizes[size];

      if (!sizeConfig) {
        continue;
      }

      const semanticWeightPair = resolveTypographyPresetWeightPair(
        preset,
        sizeConfig.semanticWeight,
        presetConfig.latinWeightOffsetSteps,
      );

      vars[`--typography-${preset}-${size}-font-size`] = resolveResponsiveFontSize(
        sizeConfig.fontSize,
        getTypographySizeToken(size).fontSize,
      );
      vars[`--typography-${preset}-${size}-line-height`] = String(sizeConfig.lineHeight);
      vars[`--typography-${preset}-${size}-cjk-edge-offset`] =
        `${sizeConfig.cjkEdgeOffset}em`;
      vars[`--typography-${preset}-${size}-cjk-baseline-offset`] =
        `${sizeConfig.cjkVerticalOffset}em`;
      vars[`--typography-${preset}-${size}-cjk-letter-spacing`] =
        `${sizeConfig.cjkLetterSpacing}em`;
      vars[`--typography-${preset}-${size}-latin-edge-offset`] =
        `${sizeConfig.latinEdgeOffset}em`;
      vars[`--typography-${preset}-${size}-latin-baseline-offset`] =
        `${sizeConfig.cjkVerticalOffset + sizeConfig.latinRelativeOffset}em`;
      vars[`--typography-${preset}-${size}-letter-spacing`] =
        `${sizeConfig.cjkLetterSpacing}em`;
      vars[`--typography-${preset}-${size}-latin-letter-spacing`] =
        `${sizeConfig.latinLetterSpacing}em`;
      vars[`--typography-${preset}-${size}-semantic-cjk-weight`] =
        String(semanticWeightPair.cjk);
      vars[`--typography-${preset}-${size}-semantic-latin-weight`] =
        String(semanticWeightPair.latin);
    }

    for (const weight of TYPOGRAPHY_WEIGHTS) {
      const mapping = resolveTypographyPresetWeightPair(
        preset,
        weight,
        presetConfig.latinWeightOffsetSteps,
      );

      vars[`--typography-${preset}-${weight}-cjk-weight`] = String(mapping.cjk);
      vars[`--typography-${preset}-${weight}-latin-weight`] = String(mapping.latin);
    }
  }

  return vars;
}
