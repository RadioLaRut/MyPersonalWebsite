import {
  clampTypographyLatinWeightOffsetSteps,
  getTypographyFontLabSizes,
  getTypographyMetricsToken,
  getTypographyPresetToken,
  getTypographySizeToken,
  resolveTypographyFontLabSize,
  TYPOGRAPHY_WEIGHTS,
  type TypographyPreset,
  type TypographySize,
  type TypographyWeight,
} from "./typography-tokens.ts";
import {
  isTypographyPreset,
  isTypographySize,
  isTypographyWeight,
} from "./typography.ts";

export const FONT_LAB_SCHEMA_VERSION = 3 as const;

export type FontLabSizeConfig = {
  cjkHorizontalOffset: number;
  cjkLetterSpacing: number;
  cjkVerticalOffset: number;
  fontSize: string;
  latinHorizontalOffset: number;
  latinLetterSpacing: number;
  latinRelativeOffset: number;
  lineHeight: number;
  semanticWeight: TypographyWeight;
};

export type FontLabPresetConfig = {
  labelZh: string;
  latinWeightOffsetSteps: number;
  sizes: Partial<Record<TypographySize, FontLabSizeConfig>>;
};

export type FontLabDocument = {
  activePreset: TypographyPreset;
  activeSize: TypographySize;
  presets: Record<TypographyPreset, FontLabPresetConfig>;
  version: typeof FONT_LAB_SCHEMA_VERSION;
};

export type FontLabSavePayload = {
  activePreset: TypographyPreset;
  activeSize: TypographySize;
  labelZh: string;
  latinWeightOffsetSteps: number;
  sizeConfig: FontLabSizeConfig;
};

type LegacyFontLabConfig = {
  cjkBaselineOffset: number;
  cjkLetterSpacing: number;
  fontSize: string;
  latinBaselineOffset: number;
  latinLetterSpacing: number;
  lineHeight: number;
  preset: TypographyPreset;
  size: TypographySize;
  tracking: number;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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

  const parsed = Number(match[3]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeFixedFontSizeValue(value: string, fallback: string) {
  const fixedRem = parseRemFontSize(value) ?? parseClampFontSize(value);

  if (fixedRem === null) {
    return fallback;
  }

  return `${Number.parseFloat(fixedRem.toFixed(4))}rem`;
}

function getDefaultFontLabSemanticWeight(size: TypographySize): TypographyWeight {
  switch (size) {
    case "caption":
    case "label":
      return "medium";
    case "body-sm":
    case "body":
      return "regular";
    case "body-lg":
      return "medium";
    case "title-sm":
    case "title":
      return "strong";
    case "menu":
      return "regular";
    case "display":
    case "hero":
      return "display";
    default:
      return "regular";
  }
}

function createDefaultFontLabSizeConfig(
  preset: TypographyPreset,
  size: TypographySize,
): FontLabSizeConfig {
  const sizeToken = getTypographySizeToken(size);
  const metrics = getTypographyMetricsToken(preset, size);
  const latinAbsoluteOffset = Number.parseFloat(metrics.latinBaselineOffset);

  return {
    cjkHorizontalOffset: 0,
    cjkLetterSpacing: Number.parseFloat(metrics.cjkLetterSpacing),
    cjkVerticalOffset: 0,
    fontSize: normalizeFixedFontSizeValue(sizeToken.fontSize, "1rem"),
    latinHorizontalOffset: 0,
    latinLetterSpacing: Number.parseFloat(metrics.latinLetterSpacing),
    latinRelativeOffset: latinAbsoluteOffset,
    lineHeight: Number.parseFloat(sizeToken.lineHeight),
    semanticWeight: getDefaultFontLabSemanticWeight(size),
  };
}

export function createDefaultFontLabPresetConfig(
  preset: TypographyPreset,
): FontLabPresetConfig {
  const presetToken = getTypographyPresetToken(preset);

  return {
    labelZh: presetToken.label,
    latinWeightOffsetSteps: 0,
    sizes: Object.fromEntries(
      getTypographyFontLabSizes(preset).map((size) => [
        size,
        createDefaultFontLabSizeConfig(preset, size),
      ]),
    ) as Partial<Record<TypographySize, FontLabSizeConfig>>,
  };
}

export function createDefaultFontLabDocument(): FontLabDocument {
  return {
    activePreset: "sans-body",
    activeSize: "body",
    presets: {
      "sans-body": createDefaultFontLabPresetConfig("sans-body"),
      "luna-editorial": createDefaultFontLabPresetConfig("luna-editorial"),
      "gothic-editorial": createDefaultFontLabPresetConfig("gothic-editorial"),
      "classical-display": createDefaultFontLabPresetConfig("classical-display"),
    },
    version: FONT_LAB_SCHEMA_VERSION,
  };
}

function getWeightIndexOffset(
  availableWeights: readonly number[],
  source: number,
  target: number,
) {
  const sourceIndex = availableWeights.indexOf(source);
  const targetIndex = availableWeights.indexOf(target);

  if (sourceIndex < 0 || targetIndex < 0) {
    return null;
  }

  return targetIndex - sourceIndex;
}

function inferLegacyLatinWeightOffsetSteps(
  preset: TypographyPreset,
  legacyWeightsSource: unknown,
) {
  if (!isPlainRecord(legacyWeightsSource)) {
    return 0;
  }

  const presetToken = getTypographyPresetToken(preset);
  const offsetCounts = new Map<number, number>();

  for (const weight of TYPOGRAPHY_WEIGHTS) {
    const mapping = legacyWeightsSource[weight];

    if (!isPlainRecord(mapping) || !isFiniteNumber(mapping.latin)) {
      continue;
    }

    const offset = getWeightIndexOffset(
      presetToken.availableWeights.latin,
      presetToken.weights[weight].latin,
      mapping.latin,
    );

    if (offset === null) {
      continue;
    }

    offsetCounts.set(offset, (offsetCounts.get(offset) ?? 0) + 1);
  }

  if (!offsetCounts.size) {
    return 0;
  }

  const [mostLikelyOffset] = [...offsetCounts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    if (Math.abs(left[0]) !== Math.abs(right[0])) {
      return Math.abs(left[0]) - Math.abs(right[0]);
    }

    return left[0] - right[0];
  })[0];

  return clampTypographyLatinWeightOffsetSteps(preset, mostLikelyOffset);
}

function normalizeLatinWeightOffsetSteps(
  preset: TypographyPreset,
  source: unknown,
  legacyWeightsSource: unknown,
) {
  if (isFiniteNumber(source)) {
    return clampTypographyLatinWeightOffsetSteps(preset, source);
  }

  return inferLegacyLatinWeightOffsetSteps(preset, legacyWeightsSource);
}

function normalizeSizeConfig(
  preset: TypographyPreset,
  size: TypographySize,
  config: unknown,
): FontLabSizeConfig {
  const defaults = createDefaultFontLabSizeConfig(preset, size);

  if (!isPlainRecord(config)) {
    return defaults;
  }

  return {
    cjkHorizontalOffset: isFiniteNumber(config.cjkHorizontalOffset)
      ? config.cjkHorizontalOffset
      : defaults.cjkHorizontalOffset,
    cjkLetterSpacing: isFiniteNumber(config.cjkLetterSpacing)
      ? config.cjkLetterSpacing
      : defaults.cjkLetterSpacing,
    cjkVerticalOffset: isFiniteNumber(config.cjkVerticalOffset)
      ? config.cjkVerticalOffset
      : defaults.cjkVerticalOffset,
    fontSize:
      typeof config.fontSize === "string"
        ? normalizeFixedFontSizeValue(config.fontSize, defaults.fontSize)
        : defaults.fontSize,
    latinHorizontalOffset: isFiniteNumber(config.latinHorizontalOffset)
      ? config.latinHorizontalOffset
      : defaults.latinHorizontalOffset,
    latinLetterSpacing: isFiniteNumber(config.latinLetterSpacing)
      ? config.latinLetterSpacing
      : defaults.latinLetterSpacing,
    latinRelativeOffset: isFiniteNumber(config.latinRelativeOffset)
      ? config.latinRelativeOffset
      : defaults.latinRelativeOffset,
    lineHeight: isFiniteNumber(config.lineHeight)
      ? config.lineHeight
      : defaults.lineHeight,
    semanticWeight:
      typeof config.semanticWeight === "string" &&
        isTypographyWeight(config.semanticWeight)
        ? config.semanticWeight
        : defaults.semanticWeight,
  };
}

export function normalizeFontLabPresetConfig(
  preset: TypographyPreset,
  config: unknown,
): FontLabPresetConfig {
  const defaults = createDefaultFontLabPresetConfig(preset);
  const source = isPlainRecord(config) ? config : {};
  const sizesSource = isPlainRecord(source.sizes) ? source.sizes : {};

  return {
    labelZh: typeof source.labelZh === "string" && source.labelZh.trim()
      ? source.labelZh
      : defaults.labelZh,
    latinWeightOffsetSteps: normalizeLatinWeightOffsetSteps(
      preset,
      source.latinWeightOffsetSteps,
      source.weights,
    ),
    sizes: Object.fromEntries(
      getTypographyFontLabSizes(preset).map((size) => [
        size,
        normalizeSizeConfig(preset, size, sizesSource[size]),
      ]),
    ) as Partial<Record<TypographySize, FontLabSizeConfig>>,
  };
}

export function normalizeFontLabDocument(
  document: FontLabDocument,
): FontLabDocument {
  const defaults = createDefaultFontLabDocument();
  const activePreset = isTypographyPreset(document.activePreset)
    ? document.activePreset
    : defaults.activePreset;
  const requestedActiveSize = isTypographySize(document.activeSize)
    ? document.activeSize
    : defaults.activeSize;
  const activeSize = resolveTypographyFontLabSize(activePreset, requestedActiveSize);

  return {
    activePreset,
    activeSize,
    presets: {
      "sans-body": normalizeFontLabPresetConfig(
        "sans-body",
        document.presets["sans-body"],
      ),
      "luna-editorial": normalizeFontLabPresetConfig(
        "luna-editorial",
        document.presets["luna-editorial"],
      ),
      "gothic-editorial": normalizeFontLabPresetConfig(
        "gothic-editorial",
        document.presets["gothic-editorial"],
      ),
      "classical-display": normalizeFontLabPresetConfig(
        "classical-display",
        document.presets["classical-display"],
      ),
    },
    version: FONT_LAB_SCHEMA_VERSION,
  };
}

function parseLegacyFontLabConfig(value: unknown): LegacyFontLabConfig | null {
  if (!isPlainRecord(value)) {
    return null;
  }

  const preset = value.preset;
  const size = value.size;

  if (
    !isTypographyPreset(String(preset)) ||
    !isTypographySize(String(size)) ||
    !isFiniteNumber(value.cjkBaselineOffset) ||
    !isFiniteNumber(value.cjkLetterSpacing) ||
    typeof value.fontSize !== "string" ||
    !isFiniteNumber(value.latinBaselineOffset) ||
    !isFiniteNumber(value.latinLetterSpacing) ||
    !isFiniteNumber(value.lineHeight) ||
    !isFiniteNumber(value.tracking)
  ) {
    return null;
  }

  return {
    cjkBaselineOffset: value.cjkBaselineOffset,
    cjkLetterSpacing: value.cjkLetterSpacing,
    fontSize: value.fontSize,
    latinBaselineOffset: value.latinBaselineOffset,
    latinLetterSpacing: value.latinLetterSpacing,
    lineHeight: value.lineHeight,
    preset: preset as TypographyPreset,
    size: size as TypographySize,
    tracking: value.tracking,
  };
}

function migrateLegacyFontLabConfig(
  legacy: LegacyFontLabConfig,
): FontLabDocument {
  const document = createDefaultFontLabDocument();
  const activePreset = legacy.preset;
  const activeSize = resolveTypographyFontLabSize(activePreset, legacy.size);

  document.activePreset = activePreset;
  document.activeSize = activeSize;
  document.presets[activePreset].sizes[activeSize] = {
    cjkHorizontalOffset: 0,
    cjkLetterSpacing: legacy.cjkLetterSpacing,
    cjkVerticalOffset: legacy.cjkBaselineOffset,
    fontSize: normalizeFixedFontSizeValue(legacy.fontSize, "1rem"),
    latinHorizontalOffset: 0,
    latinLetterSpacing: legacy.latinLetterSpacing,
    latinRelativeOffset: legacy.latinBaselineOffset - legacy.cjkBaselineOffset,
    lineHeight: legacy.lineHeight,
    semanticWeight: getDefaultFontLabSemanticWeight(activeSize),
  };

  return document;
}

function isSupportedFontLabDocumentVersion(value: unknown) {
  return value === FONT_LAB_SCHEMA_VERSION || value === 2;
}

export function parseFontLabDocument(value: unknown): FontLabDocument | null {
  if (!isPlainRecord(value)) {
    return null;
  }

  if (
    isSupportedFontLabDocumentVersion(value.version) &&
    isTypographyPreset(String(value.activePreset)) &&
    isTypographySize(String(value.activeSize)) &&
    isPlainRecord(value.presets)
  ) {
    return normalizeFontLabDocument({
      activePreset: value.activePreset as TypographyPreset,
      activeSize: value.activeSize as TypographySize,
      presets: {
        "sans-body": normalizeFontLabPresetConfig(
          "sans-body",
          value.presets["sans-body"],
        ),
        "luna-editorial": normalizeFontLabPresetConfig(
          "luna-editorial",
          value.presets["luna-editorial"],
        ),
        "gothic-editorial": normalizeFontLabPresetConfig(
          "gothic-editorial",
          value.presets["gothic-editorial"],
        ),
        "classical-display": normalizeFontLabPresetConfig(
          "classical-display",
          value.presets["classical-display"],
        ),
      },
      version: FONT_LAB_SCHEMA_VERSION,
    });
  }

  const legacy = parseLegacyFontLabConfig(value);
  if (!legacy) {
    return null;
  }

  return migrateLegacyFontLabConfig(legacy);
}

export function parseFontLabSavePayload(
  value: unknown,
): FontLabSavePayload | null {
  if (!isPlainRecord(value)) {
    return null;
  }

  const activePreset = value.activePreset;
  const activeSize = value.activeSize;
  const labelZh = value.labelZh;
  const sizeConfig = value.sizeConfig;

  if (
    !isTypographyPreset(String(activePreset)) ||
    !isTypographySize(String(activeSize))
  ) {
    return null;
  }

  const normalizedPresetConfig = normalizeFontLabPresetConfig(
    activePreset as TypographyPreset,
    {
      labelZh,
      latinWeightOffsetSteps: value.latinWeightOffsetSteps,
      weights: value.weights,
    },
  );

  return {
    activePreset: activePreset as TypographyPreset,
    activeSize: activeSize as TypographySize,
    labelZh: normalizedPresetConfig.labelZh,
    latinWeightOffsetSteps: normalizedPresetConfig.latinWeightOffsetSteps,
    sizeConfig: normalizeSizeConfig(
      activePreset as TypographyPreset,
      activeSize as TypographySize,
      sizeConfig,
    ),
  };
}
