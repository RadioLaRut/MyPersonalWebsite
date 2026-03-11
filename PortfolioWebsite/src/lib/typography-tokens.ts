export const TYPOGRAPHY_PRESETS = [
  "sans-body",
  "luna-editorial",
  "gothic-editorial",
  "classical-display",
] as const;

export const TYPOGRAPHY_SIZES = [
  "caption",
  "label",
  "body-sm",
  "body",
  "body-lg",
  "title-sm",
  "menu",
  "title",
  "display",
  "hero",
] as const;

export const TYPOGRAPHY_WEIGHTS = [
  "light",
  "regular",
  "medium",
  "strong",
  "display",
] as const;

export const TYPOGRAPHY_WRAP_POLICIES = [
  "prose",
  "heading",
  "label",
  "url",
  "code",
] as const;

export const TYPOGRAPHY_AUTOSPACE = ["off", "normal"] as const;

export const TYPOGRAPHY_NUMERIC_STYLES = ["default", "tabular"] as const;

export type TypographyPreset = (typeof TYPOGRAPHY_PRESETS)[number];
export type TypographySize = (typeof TYPOGRAPHY_SIZES)[number];
export type TypographyWeight = (typeof TYPOGRAPHY_WEIGHTS)[number];
export type TypographyWrapPolicy = (typeof TYPOGRAPHY_WRAP_POLICIES)[number];
export type TypographyAutospace = (typeof TYPOGRAPHY_AUTOSPACE)[number];
export type TypographyNumericStyle = (typeof TYPOGRAPHY_NUMERIC_STYLES)[number];
export type TypographyScript = "latin" | "cjk";

export type TypographySizeToken = {
  fontSize: string;
  letterSpacing: string;
  lineHeight: string;
};

export type TypographyWeightPair = {
  cjk: number;
  latin: number;
};

export type TypographyMetricsToken = {
  cjkBaselineOffset: string;
  cjkLetterSpacing: string;
  latinBaselineOffset: string;
  latinLetterSpacing: string;
};

export type TypographyPresetToken = {
  cjkFontFamily: string;
  label: string;
  latinFontFamily: string;
  supportedSizes: readonly TypographySize[];
  weights: Record<TypographyWeight, TypographyWeightPair>;
};

export const TYPOGRAPHY_SIZE_TOKENS: Record<TypographySize, TypographySizeToken> = {
  caption: {
    fontSize: "0.625rem",
    letterSpacing: "0.18em",
    lineHeight: "1.4",
  },
  label: {
    fontSize: "0.75rem",
    letterSpacing: "0.14em",
    lineHeight: "1.45",
  },
  "body-sm": {
    fontSize: "0.9375rem",
    letterSpacing: "0.01em",
    lineHeight: "1.85",
  },
  body: {
    fontSize: "1rem",
    letterSpacing: "0.012em",
    lineHeight: "1.9",
  },
  "body-lg": {
    fontSize: "clamp(1.125rem,1.15vw,1.375rem)",
    letterSpacing: "0.014em",
    lineHeight: "1.85",
  },
  "title-sm": {
    fontSize: "clamp(1.5rem,3vw,2rem)",
    letterSpacing: "0.01em",
    lineHeight: "1.05",
  },
  menu: {
    fontSize: "1.875rem",
    letterSpacing: "0.015em",
    lineHeight: "1",
  },
  title: {
    fontSize: "clamp(2.4rem,7vw,5.4rem)",
    letterSpacing: "0.015em",
    lineHeight: "0.92",
  },
  display: {
    fontSize: "clamp(3.6rem,13vw,9.2rem)",
    letterSpacing: "0.015em",
    lineHeight: "0.88",
  },
  hero: {
    fontSize: "clamp(4.8rem,13vw,10rem)",
    letterSpacing: "0.015em",
    lineHeight: "0.9",
  },
};

const SHARED_EDITORIAL_SIZES: readonly TypographySize[] = [
  "caption",
  "label",
  "body-sm",
  "body",
  "body-lg",
  "title-sm",
  "menu",
  "title",
  "display",
  "hero",
] as const;

export const TYPOGRAPHY_PRESET_TOKENS: Record<TypographyPreset, TypographyPresetToken> = {
  "sans-body": {
    cjkFontFamily: "var(--font-cjk-sans), sans-serif",
    label: "Futura + 汉仪旗黑",
    latinFontFamily: "var(--font-latin-sans), sans-serif",
    supportedSizes: SHARED_EDITORIAL_SIZES,
    weights: {
      light: { cjk: 400, latin: 300 },
      regular: { cjk: 400, latin: 400 },
      medium: { cjk: 500, latin: 500 },
      strong: { cjk: 700, latin: 500 },
      display: { cjk: 900, latin: 900 },
    },
  },
  "luna-editorial": {
    cjkFontFamily: "var(--font-cjk-editorial), serif",
    label: "Luna + 中文衬线体",
    latinFontFamily: "var(--font-latin-editorial), serif",
    supportedSizes: SHARED_EDITORIAL_SIZES,
    weights: {
      light: { cjk: 300, latin: 400 },
      regular: { cjk: 400, latin: 400 },
      medium: { cjk: 500, latin: 400 },
      strong: { cjk: 700, latin: 700 },
      display: { cjk: 900, latin: 700 },
    },
  },
  "gothic-editorial": {
    cjkFontFamily: "var(--font-cjk-editorial), serif",
    label: "Gothic + 中文衬线体",
    latinFontFamily: "var(--font-latin-gothic), serif",
    supportedSizes: SHARED_EDITORIAL_SIZES,
    weights: {
      light: { cjk: 300, latin: 300 },
      regular: { cjk: 400, latin: 400 },
      medium: { cjk: 500, latin: 400 },
      strong: { cjk: 700, latin: 800 },
      display: { cjk: 900, latin: 900 },
    },
  },
  "classical-display": {
    cjkFontFamily: "var(--font-cjk-classical), serif",
    label: "古典展示占位",
    latinFontFamily: "var(--font-latin-classical), serif",
    supportedSizes: ["menu", "display", "hero"],
    weights: {
      light: { cjk: 300, latin: 400 },
      regular: { cjk: 400, latin: 400 },
      medium: { cjk: 500, latin: 400 },
      strong: { cjk: 700, latin: 400 },
      display: { cjk: 900, latin: 400 },
    },
  },
};

const DEFAULT_METRICS: Record<TypographySize, TypographyMetricsToken> = {
  caption: {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.018em",
    latinLetterSpacing: "0em",
  },
  label: {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.02em",
    latinLetterSpacing: "0em",
  },
  "body-sm": {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.03em",
    latinLetterSpacing: "0em",
  },
  body: {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.032em",
    latinLetterSpacing: "0em",
  },
  "body-lg": {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.035em",
    latinLetterSpacing: "0em",
  },
  "title-sm": {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.04em",
    latinLetterSpacing: "0em",
  },
  menu: {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.042em",
    latinLetterSpacing: "0em",
  },
  title: {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.045em",
    latinLetterSpacing: "0em",
  },
  display: {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.05em",
    latinLetterSpacing: "0em",
  },
  hero: {
    cjkBaselineOffset: "0em",
    cjkLetterSpacing: "0em",
    latinBaselineOffset: "-0.048em",
    latinLetterSpacing: "0em",
  },
};

export const TYPOGRAPHY_METRICS_TOKENS: Record<
  TypographyPreset,
  Record<TypographySize, TypographyMetricsToken>
> = {
  "sans-body": DEFAULT_METRICS,
  "luna-editorial": {
    ...DEFAULT_METRICS,
    "title-sm": {
      cjkBaselineOffset: "0.01em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.012em",
      latinLetterSpacing: "0em",
    },
    menu: {
      cjkBaselineOffset: "0.01em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.012em",
      latinLetterSpacing: "0em",
    },
    title: {
      cjkBaselineOffset: "0.01em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.012em",
      latinLetterSpacing: "0em",
    },
    display: {
      cjkBaselineOffset: "0.012em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.014em",
      latinLetterSpacing: "0em",
    },
    hero: {
      cjkBaselineOffset: "0.012em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.014em",
      latinLetterSpacing: "0em",
    },
  },
  "gothic-editorial": {
    ...DEFAULT_METRICS,
    caption: {
      cjkBaselineOffset: "0.008em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.01em",
      latinLetterSpacing: "0.01em",
    },
    label: {
      cjkBaselineOffset: "0.008em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.012em",
      latinLetterSpacing: "0.01em",
    },
    "body-sm": {
      cjkBaselineOffset: "0.006em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.016em",
      latinLetterSpacing: "0.008em",
    },
    body: {
      cjkBaselineOffset: "0.006em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.018em",
      latinLetterSpacing: "0.008em",
    },
    "body-lg": {
      cjkBaselineOffset: "0.006em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.02em",
      latinLetterSpacing: "0.006em",
    },
    "title-sm": {
      cjkBaselineOffset: "0.008em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.022em",
      latinLetterSpacing: "0.004em",
    },
    menu: {
      cjkBaselineOffset: "0.009em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.023em",
      latinLetterSpacing: "0.004em",
    },
    title: {
      cjkBaselineOffset: "0.01em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.024em",
      latinLetterSpacing: "0.004em",
    },
    display: {
      cjkBaselineOffset: "0.012em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.026em",
      latinLetterSpacing: "0.004em",
    },
    hero: {
      cjkBaselineOffset: "0.012em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.026em",
      latinLetterSpacing: "0.004em",
    },
  },
  "classical-display": {
    ...DEFAULT_METRICS,
    caption: DEFAULT_METRICS.display,
    label: DEFAULT_METRICS.display,
    "body-sm": DEFAULT_METRICS.display,
    body: DEFAULT_METRICS.display,
    "body-lg": DEFAULT_METRICS.display,
    "title-sm": DEFAULT_METRICS.display,
    menu: {
      cjkBaselineOffset: "0.01em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.008em",
      latinLetterSpacing: "0.018em",
    },
    title: DEFAULT_METRICS.display,
    display: {
      cjkBaselineOffset: "0.012em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.01em",
      latinLetterSpacing: "0.02em",
    },
    hero: {
      cjkBaselineOffset: "0.014em",
      cjkLetterSpacing: "0em",
      latinBaselineOffset: "-0.012em",
      latinLetterSpacing: "0.02em",
    },
  },
};

export const TYPOGRAPHY_WRAP_POLICY_TOKENS: Record<
  TypographyWrapPolicy,
  {
    hyphens: "none" | "manual" | "auto";
    overflowWrap: "normal" | "break-word" | "anywhere";
    whiteSpace: "normal" | "nowrap" | "pre-wrap";
    wordBreak: "normal" | "keep-all" | "break-all";
  }
> = {
  prose: {
    hyphens: "none",
    overflowWrap: "normal",
    whiteSpace: "normal",
    wordBreak: "normal",
  },
  heading: {
    hyphens: "manual",
    overflowWrap: "break-word",
    whiteSpace: "normal",
    wordBreak: "normal",
  },
  label: {
    hyphens: "none",
    overflowWrap: "normal",
    whiteSpace: "nowrap",
    wordBreak: "keep-all",
  },
  url: {
    hyphens: "none",
    overflowWrap: "anywhere",
    whiteSpace: "normal",
    wordBreak: "normal",
  },
  code: {
    hyphens: "none",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
    wordBreak: "normal",
  },
};

export function getTypographyPresetToken(preset: TypographyPreset) {
  return TYPOGRAPHY_PRESET_TOKENS[preset];
}

export function getTypographySizeToken(size: TypographySize) {
  return TYPOGRAPHY_SIZE_TOKENS[size];
}

export function getTypographyMetricsToken(
  preset: TypographyPreset,
  size: TypographySize,
) {
  return TYPOGRAPHY_METRICS_TOKENS[preset][size];
}

export function getTypographyWrapToken(wrapPolicy: TypographyWrapPolicy) {
  return TYPOGRAPHY_WRAP_POLICY_TOKENS[wrapPolicy];
}

export function isTypographySizeSupported(
  preset: TypographyPreset,
  size: TypographySize,
) {
  return TYPOGRAPHY_PRESET_TOKENS[preset].supportedSizes.includes(size);
}
