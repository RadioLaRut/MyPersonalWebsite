import {
  clampTypographyLatinWeightOffsetSteps,
  getDefaultTypographySemanticWeight,
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
import { PREVIEW_REFERENCE_VIEWPORT_PX } from "./preview-viewports.ts";

export const FONT_LAB_SCHEMA_VERSION = 6 as const;

type FontLabFontSizeMode = "reference" | "legacy-max";

export type FontLabSizeConfig = {
  cjkEdgeOffset: number;
  cjkLetterSpacing: number;
  cjkVerticalOffset: number;
  fontSize: string;
  latinEdgeOffset: number;
  latinLetterSpacing: number;
  latinRelativeOffset: number;
  lineHeight: number;
  semanticWeight: TypographyWeight;
};

export type FontLabPresetConfig = {
  labelZh: string;
  latinFontScale: number;
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
  latinFontScale: number;
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

function parseClampFontSizeParts(value: string) {
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

function getClampReferenceRem(clamp: {
  maxRem: number;
  minRem: number;
  viewportVw: number;
}) {
  const preferredRem = (clamp.viewportVw * PREVIEW_REFERENCE_VIEWPORT_PX) / 100 / 16;
  return Math.min(Math.max(preferredRem, clamp.minRem), clamp.maxRem);
}

function parseClampFontSize(value: string) {
  const parsed = parseClampFontSizeParts(value);

  if (!parsed) {
    return null;
  }

  return getClampReferenceRem(parsed);
}

function formatFixedFontSizeRem(value: number) {
  return `${Number.parseFloat(value.toFixed(4))}rem`;
}

function normalizeReferenceFontSizeValue(value: string, fallback: string) {
  const fixedRem = parseRemFontSize(value) ?? parseClampFontSize(value);

  if (fixedRem === null) {
    return fallback;
  }

  return formatFixedFontSizeRem(fixedRem);
}

function normalizeLegacyMaxFontSizeValue(
  size: TypographySize,
  value: string,
  fallback: string,
) {
  const fixedRem = parseRemFontSize(value) ?? parseClampFontSize(value);

  if (fixedRem === null) {
    return fallback;
  }

  const tokenClamp = parseClampFontSizeParts(getTypographySizeToken(size).fontSize);

  if (!tokenClamp || tokenClamp.maxRem <= 0) {
    return formatFixedFontSizeRem(fixedRem);
  }

  const tokenReferenceRem = getClampReferenceRem(tokenClamp);

  if (!Number.isFinite(tokenReferenceRem) || tokenReferenceRem <= 0) {
    return fallback;
  }

  return formatFixedFontSizeRem((fixedRem / tokenClamp.maxRem) * tokenReferenceRem);
}

function normalizeFixedFontSizeValue(
  size: TypographySize,
  value: string,
  fallback: string,
  mode: FontLabFontSizeMode,
) {
  if (mode === "legacy-max") {
    return normalizeLegacyMaxFontSizeValue(size, value, fallback);
  }

  return normalizeReferenceFontSizeValue(value, fallback);
}

function normalizeLatinFontScale(value: unknown) {
  if (!isFiniteNumber(value) || value <= 0) {
    return 1;
  }

  return Number.parseFloat(value.toFixed(4));
}

function createDefaultFontLabSizeConfig(
  preset: TypographyPreset,
  size: TypographySize,
): FontLabSizeConfig {
  const sizeToken = getTypographySizeToken(size);
  const metrics = getTypographyMetricsToken(preset, size);
  const latinAbsoluteOffset = Number.parseFloat(metrics.latinBaselineOffset);

  return {
    cjkEdgeOffset: 0,
    cjkLetterSpacing: Number.parseFloat(metrics.cjkLetterSpacing),
    cjkVerticalOffset: 0,
    fontSize: normalizeReferenceFontSizeValue(sizeToken.fontSize, "1rem"),
    latinEdgeOffset: 0,
    latinLetterSpacing: Number.parseFloat(metrics.latinLetterSpacing),
    latinRelativeOffset: latinAbsoluteOffset,
    lineHeight: Number.parseFloat(sizeToken.lineHeight),
    semanticWeight: getDefaultTypographySemanticWeight(size),
  };
}

export function createDefaultFontLabPresetConfig(
  preset: TypographyPreset,
): FontLabPresetConfig {
  const presetToken = getTypographyPresetToken(preset);

  return {
    labelZh: presetToken.label,
    latinFontScale: 1,
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
  fontSizeMode: FontLabFontSizeMode = "reference",
): FontLabSizeConfig {
  const defaults = createDefaultFontLabSizeConfig(preset, size);

  if (!isPlainRecord(config)) {
    return defaults;
  }

  return {
    cjkEdgeOffset: isFiniteNumber(config.cjkEdgeOffset)
      ? config.cjkEdgeOffset
      : isFiniteNumber(config.cjkHorizontalOffset)
        ? config.cjkHorizontalOffset
        : defaults.cjkEdgeOffset,
    cjkLetterSpacing: isFiniteNumber(config.cjkLetterSpacing)
      ? config.cjkLetterSpacing
      : defaults.cjkLetterSpacing,
    cjkVerticalOffset: isFiniteNumber(config.cjkVerticalOffset)
      ? config.cjkVerticalOffset
      : defaults.cjkVerticalOffset,
    fontSize:
      typeof config.fontSize === "string"
        ? normalizeFixedFontSizeValue(
          size,
          config.fontSize,
          defaults.fontSize,
          fontSizeMode,
        )
        : defaults.fontSize,
    latinEdgeOffset: isFiniteNumber(config.latinEdgeOffset)
      ? config.latinEdgeOffset
      : isFiniteNumber(config.latinHorizontalOffset)
        ? config.latinHorizontalOffset
        : defaults.latinEdgeOffset,
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
  options: {
    fontSizeMode?: FontLabFontSizeMode;
  } = {},
): FontLabPresetConfig {
  const defaults = createDefaultFontLabPresetConfig(preset);
  const source = isPlainRecord(config) ? config : {};
  const sizesSource = isPlainRecord(source.sizes) ? source.sizes : {};
  const fontSizeMode = options.fontSizeMode ?? "reference";

  return {
    labelZh: typeof source.labelZh === "string" && source.labelZh.trim()
      ? source.labelZh
      : defaults.labelZh,
    latinFontScale: normalizeLatinFontScale(source.latinFontScale),
    latinWeightOffsetSteps: normalizeLatinWeightOffsetSteps(
      preset,
      source.latinWeightOffsetSteps,
      source.weights,
    ),
    sizes: Object.fromEntries(
      getTypographyFontLabSizes(preset).map((size) => [
        size,
        normalizeSizeConfig(preset, size, sizesSource[size], fontSizeMode),
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
    cjkEdgeOffset: 0,
    cjkLetterSpacing: legacy.cjkLetterSpacing,
    cjkVerticalOffset: legacy.cjkBaselineOffset,
    fontSize: normalizeReferenceFontSizeValue(legacy.fontSize, "1rem"),
    latinEdgeOffset: 0,
    latinLetterSpacing: legacy.latinLetterSpacing,
    latinRelativeOffset: legacy.latinBaselineOffset - legacy.cjkBaselineOffset,
    lineHeight: legacy.lineHeight,
    semanticWeight: getDefaultTypographySemanticWeight(activeSize),
  };

  return document;
}

function isSupportedFontLabDocumentVersion(value: unknown) {
  return value === FONT_LAB_SCHEMA_VERSION || value === 5 || value === 4 ||
    value === 3 || value === 2;
}

function getDocumentFontSizeMode(version: unknown): FontLabFontSizeMode {
  return version === FONT_LAB_SCHEMA_VERSION ? "reference" : "legacy-max";
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
    const fontSizeMode = getDocumentFontSizeMode(value.version);

    return normalizeFontLabDocument({
      activePreset: value.activePreset as TypographyPreset,
      activeSize: value.activeSize as TypographySize,
      presets: {
        "sans-body": normalizeFontLabPresetConfig(
          "sans-body",
          value.presets["sans-body"],
          { fontSizeMode },
        ),
        "luna-editorial": normalizeFontLabPresetConfig(
          "luna-editorial",
          value.presets["luna-editorial"],
          { fontSizeMode },
        ),
        "gothic-editorial": normalizeFontLabPresetConfig(
          "gothic-editorial",
          value.presets["gothic-editorial"],
          { fontSizeMode },
        ),
        "classical-display": normalizeFontLabPresetConfig(
          "classical-display",
          value.presets["classical-display"],
          { fontSizeMode },
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
      latinFontScale: value.latinFontScale,
      latinWeightOffsetSteps: value.latinWeightOffsetSteps,
      weights: value.weights,
    },
  );

  return {
    activePreset: activePreset as TypographyPreset,
    activeSize: activeSize as TypographySize,
    labelZh: normalizedPresetConfig.labelZh,
    latinFontScale: normalizedPresetConfig.latinFontScale,
    latinWeightOffsetSteps: normalizedPresetConfig.latinWeightOffsetSteps,
    sizeConfig: normalizeSizeConfig(
      activePreset as TypographyPreset,
      activeSize as TypographySize,
      sizeConfig,
    ),
  };
}
