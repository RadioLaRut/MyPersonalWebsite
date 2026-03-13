import type { TypographySize } from "@/lib/typography-tokens";

export const COMPONENT_DESIGN_SCHEMA_VERSION = 1 as const;

export const COMPONENT_DESIGN_COMPONENT_KEYS = [
  "RichParagraph",
  "ContentCard",
  "TextSplitLayout",
  "HighDensityInfoBlock",
] as const;

export const COMPONENT_DESIGN_SPACING_TOKENS = [
  "12",
  "16",
  "20",
  "24",
  "32",
  "48",
  "56",
  "64",
] as const;

export const COMPONENT_DESIGN_SECTION_SPACING_TOKENS = [
  "section-normal",
  "section-spacious",
  "block",
  "block-compact",
] as const;

export type ComponentDesignComponentKey =
  (typeof COMPONENT_DESIGN_COMPONENT_KEYS)[number];

export type ComponentDesignSpacingToken =
  (typeof COMPONENT_DESIGN_SPACING_TOKENS)[number];

export type ComponentDesignSectionSpacingToken =
  (typeof COMPONENT_DESIGN_SECTION_SPACING_TOKENS)[number];

export type ComponentGridBounds = {
  leftCol: number;
  rightCol: number;
};

export type RichParagraphDesign = {
  bodyAutoWrap: boolean;
  bodySize: TypographySize;
  contentBounds: ComponentGridBounds;
  sectionSpacing: ComponentDesignSectionSpacingToken;
};

export type ContentCardDesign = {
  bodyAutoWrap: boolean;
  bodySize: TypographySize;
  imageLeftMediaBounds: ComponentGridBounds;
  imageLeftTextBounds: ComponentGridBounds;
  imageRightMediaBounds: ComponentGridBounds;
  imageRightTextBounds: ComponentGridBounds;
  mobileMediaTopSpacing: ComponentDesignSpacingToken;
  paragraphGap: ComponentDesignSpacingToken;
  sectionSpacing: ComponentDesignSectionSpacingToken;
  textOnlyBounds: ComponentGridBounds;
  titleAutoWrap: boolean;
  titleBodyGap: ComponentDesignSpacingToken;
  titleSize: TypographySize;
};

export type TextSplitLayoutDesign = {
  bodyAutoWrap: boolean;
  bodySize: TypographySize;
  headingAutoWrap: boolean;
  headingImageGap: ComponentDesignSpacingToken;
  paragraphGap: ComponentDesignSpacingToken;
  sectionSpacing: ComponentDesignSectionSpacingToken;
  splitHeadingSize: TypographySize;
  splitLeftHeadingBounds: ComponentGridBounds;
  splitLeftTextBounds: ComponentGridBounds;
  splitRightHeadingBounds: ComponentGridBounds;
  splitRightTextBounds: ComponentGridBounds;
  stackBounds: ComponentGridBounds;
  stackHeadingSize: TypographySize;
  stackImageTopSpacing: ComponentDesignSpacingToken;
  stackTextTopSpacing: ComponentDesignSpacingToken;
};

export type HighDensityInfoBlockDesign = {
  bodyAutoWrap: boolean;
  bodySize: TypographySize;
  imageTopSpacing: ComponentDesignSpacingToken;
  itemsTopSpacing: ComponentDesignSpacingToken;
  middleBounds: ComponentGridBounds;
  phaseTitleGap: ComponentDesignSpacingToken;
  rightBounds: ComponentGridBounds;
  sectionSpacing: ComponentDesignSectionSpacingToken;
  subtitleAutoWrap: boolean;
  subtitleGap: ComponentDesignSpacingToken;
  titleAutoWrap: boolean;
  titleBodyGap: ComponentDesignSpacingToken;
  titleSize: TypographySize;
  leftBounds: ComponentGridBounds;
};

export type ComponentDesignDocument = {
  components: {
    ContentCard: ContentCardDesign;
    HighDensityInfoBlock: HighDensityInfoBlockDesign;
    RichParagraph: RichParagraphDesign;
    TextSplitLayout: TextSplitLayoutDesign;
  };
  version: typeof COMPONENT_DESIGN_SCHEMA_VERSION;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isFiniteInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isTypographySize(value: unknown): value is TypographySize {
  return typeof value === "string" && [
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
  ].includes(value);
}

function isSpacingToken(value: unknown): value is ComponentDesignSpacingToken {
  return typeof value === "string" &&
    COMPONENT_DESIGN_SPACING_TOKENS.includes(value as ComponentDesignSpacingToken);
}

function isSectionSpacingToken(
  value: unknown,
): value is ComponentDesignSectionSpacingToken {
  return typeof value === "string" &&
    COMPONENT_DESIGN_SECTION_SPACING_TOKENS.includes(
      value as ComponentDesignSectionSpacingToken,
    );
}

function createDefaultBounds(
  leftCol: number,
  rightCol: number,
): ComponentGridBounds {
  return {
    leftCol,
    rightCol,
  };
}

function normalizeBounds(
  value: unknown,
  fallback: ComponentGridBounds,
): ComponentGridBounds {
  if (!isPlainRecord(value)) {
    return fallback;
  }

  const leftCol = value.leftCol;
  const rightCol = value.rightCol;

  if (
    !isFiniteInteger(leftCol) ||
    !isFiniteInteger(rightCol) ||
    leftCol < 1 ||
    rightCol > 12 ||
    leftCol > rightCol
  ) {
    return fallback;
  }

  return {
    leftCol,
    rightCol,
  };
}

function normalizeRichParagraphDesign(value: unknown): RichParagraphDesign {
  const defaults = createDefaultComponentDesignDocument().components.RichParagraph;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    bodyAutoWrap: isBoolean(value.bodyAutoWrap)
      ? value.bodyAutoWrap
      : defaults.bodyAutoWrap,
    bodySize: isTypographySize(value.bodySize) ? value.bodySize : defaults.bodySize,
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
    sectionSpacing: isSectionSpacingToken(value.sectionSpacing)
      ? value.sectionSpacing
      : defaults.sectionSpacing,
  };
}

function normalizeContentCardDesign(value: unknown): ContentCardDesign {
  const defaults = createDefaultComponentDesignDocument().components.ContentCard;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    bodyAutoWrap: isBoolean(value.bodyAutoWrap)
      ? value.bodyAutoWrap
      : defaults.bodyAutoWrap,
    bodySize: isTypographySize(value.bodySize) ? value.bodySize : defaults.bodySize,
    imageLeftMediaBounds: normalizeBounds(
      value.imageLeftMediaBounds,
      defaults.imageLeftMediaBounds,
    ),
    imageLeftTextBounds: normalizeBounds(
      value.imageLeftTextBounds,
      defaults.imageLeftTextBounds,
    ),
    imageRightMediaBounds: normalizeBounds(
      value.imageRightMediaBounds,
      defaults.imageRightMediaBounds,
    ),
    imageRightTextBounds: normalizeBounds(
      value.imageRightTextBounds,
      defaults.imageRightTextBounds,
    ),
    mobileMediaTopSpacing: isSpacingToken(value.mobileMediaTopSpacing)
      ? value.mobileMediaTopSpacing
      : defaults.mobileMediaTopSpacing,
    paragraphGap: isSpacingToken(value.paragraphGap)
      ? value.paragraphGap
      : defaults.paragraphGap,
    sectionSpacing: isSectionSpacingToken(value.sectionSpacing)
      ? value.sectionSpacing
      : defaults.sectionSpacing,
    textOnlyBounds: normalizeBounds(value.textOnlyBounds, defaults.textOnlyBounds),
    titleAutoWrap: isBoolean(value.titleAutoWrap)
      ? value.titleAutoWrap
      : defaults.titleAutoWrap,
    titleBodyGap: isSpacingToken(value.titleBodyGap)
      ? value.titleBodyGap
      : defaults.titleBodyGap,
    titleSize: isTypographySize(value.titleSize) ? value.titleSize : defaults.titleSize,
  };
}

function normalizeTextSplitLayoutDesign(value: unknown): TextSplitLayoutDesign {
  const defaults = createDefaultComponentDesignDocument().components.TextSplitLayout;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    bodyAutoWrap: isBoolean(value.bodyAutoWrap)
      ? value.bodyAutoWrap
      : defaults.bodyAutoWrap,
    bodySize: isTypographySize(value.bodySize) ? value.bodySize : defaults.bodySize,
    headingAutoWrap: isBoolean(value.headingAutoWrap)
      ? value.headingAutoWrap
      : defaults.headingAutoWrap,
    headingImageGap: isSpacingToken(value.headingImageGap)
      ? value.headingImageGap
      : defaults.headingImageGap,
    paragraphGap: isSpacingToken(value.paragraphGap)
      ? value.paragraphGap
      : defaults.paragraphGap,
    sectionSpacing: isSectionSpacingToken(value.sectionSpacing)
      ? value.sectionSpacing
      : defaults.sectionSpacing,
    splitHeadingSize: isTypographySize(value.splitHeadingSize)
      ? value.splitHeadingSize
      : defaults.splitHeadingSize,
    splitLeftHeadingBounds: normalizeBounds(
      value.splitLeftHeadingBounds,
      defaults.splitLeftHeadingBounds,
    ),
    splitLeftTextBounds: normalizeBounds(
      value.splitLeftTextBounds,
      defaults.splitLeftTextBounds,
    ),
    splitRightHeadingBounds: normalizeBounds(
      value.splitRightHeadingBounds,
      defaults.splitRightHeadingBounds,
    ),
    splitRightTextBounds: normalizeBounds(
      value.splitRightTextBounds,
      defaults.splitRightTextBounds,
    ),
    stackBounds: normalizeBounds(value.stackBounds, defaults.stackBounds),
    stackHeadingSize: isTypographySize(value.stackHeadingSize)
      ? value.stackHeadingSize
      : defaults.stackHeadingSize,
    stackImageTopSpacing: isSpacingToken(value.stackImageTopSpacing)
      ? value.stackImageTopSpacing
      : defaults.stackImageTopSpacing,
    stackTextTopSpacing: isSpacingToken(value.stackTextTopSpacing)
      ? value.stackTextTopSpacing
      : defaults.stackTextTopSpacing,
  };
}

function normalizeHighDensityInfoBlockDesign(
  value: unknown,
): HighDensityInfoBlockDesign {
  const defaults = createDefaultComponentDesignDocument().components.HighDensityInfoBlock;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    bodyAutoWrap: isBoolean(value.bodyAutoWrap)
      ? value.bodyAutoWrap
      : defaults.bodyAutoWrap,
    bodySize: isTypographySize(value.bodySize) ? value.bodySize : defaults.bodySize,
    imageTopSpacing: isSpacingToken(value.imageTopSpacing)
      ? value.imageTopSpacing
      : defaults.imageTopSpacing,
    itemsTopSpacing: isSpacingToken(value.itemsTopSpacing)
      ? value.itemsTopSpacing
      : defaults.itemsTopSpacing,
    leftBounds: normalizeBounds(value.leftBounds, defaults.leftBounds),
    middleBounds: normalizeBounds(value.middleBounds, defaults.middleBounds),
    phaseTitleGap: isSpacingToken(value.phaseTitleGap)
      ? value.phaseTitleGap
      : defaults.phaseTitleGap,
    rightBounds: normalizeBounds(value.rightBounds, defaults.rightBounds),
    sectionSpacing: isSectionSpacingToken(value.sectionSpacing)
      ? value.sectionSpacing
      : defaults.sectionSpacing,
    subtitleAutoWrap: isBoolean(value.subtitleAutoWrap)
      ? value.subtitleAutoWrap
      : defaults.subtitleAutoWrap,
    subtitleGap: isSpacingToken(value.subtitleGap)
      ? value.subtitleGap
      : defaults.subtitleGap,
    titleAutoWrap: isBoolean(value.titleAutoWrap)
      ? value.titleAutoWrap
      : defaults.titleAutoWrap,
    titleBodyGap: isSpacingToken(value.titleBodyGap)
      ? value.titleBodyGap
      : defaults.titleBodyGap,
    titleSize: isTypographySize(value.titleSize) ? value.titleSize : defaults.titleSize,
  };
}

export function createDefaultComponentDesignDocument(): ComponentDesignDocument {
  return {
    components: {
      ContentCard: {
        bodyAutoWrap: true,
        bodySize: "body",
        imageLeftMediaBounds: createDefaultBounds(1, 8),
        imageLeftTextBounds: createDefaultBounds(9, 12),
        imageRightMediaBounds: createDefaultBounds(5, 12),
        imageRightTextBounds: createDefaultBounds(1, 4),
        mobileMediaTopSpacing: "48",
        paragraphGap: "20",
        sectionSpacing: "block-compact",
        textOnlyBounds: createDefaultBounds(3, 10),
        titleAutoWrap: true,
        titleBodyGap: "32",
        titleSize: "title",
      },
      HighDensityInfoBlock: {
        bodyAutoWrap: true,
        bodySize: "body",
        imageTopSpacing: "24",
        itemsTopSpacing: "32",
        leftBounds: createDefaultBounds(1, 3),
        middleBounds: createDefaultBounds(4, 7),
        phaseTitleGap: "16",
        rightBounds: createDefaultBounds(8, 12),
        sectionSpacing: "block",
        subtitleAutoWrap: true,
        subtitleGap: "24",
        titleAutoWrap: true,
        titleBodyGap: "32",
        titleSize: "title-sm",
      },
      RichParagraph: {
        bodyAutoWrap: true,
        bodySize: "body",
        contentBounds: createDefaultBounds(3, 10),
        sectionSpacing: "section-spacious",
      },
      TextSplitLayout: {
        bodyAutoWrap: true,
        bodySize: "body",
        headingAutoWrap: true,
        headingImageGap: "32",
        paragraphGap: "56",
        sectionSpacing: "block",
        splitHeadingSize: "title",
        splitLeftHeadingBounds: createDefaultBounds(1, 5),
        splitLeftTextBounds: createDefaultBounds(6, 12),
        splitRightHeadingBounds: createDefaultBounds(6, 12),
        splitRightTextBounds: createDefaultBounds(1, 5),
        stackBounds: createDefaultBounds(3, 10),
        stackHeadingSize: "display",
        stackImageTopSpacing: "64",
        stackTextTopSpacing: "48",
      },
    },
    version: COMPONENT_DESIGN_SCHEMA_VERSION,
  };
}

export function normalizeComponentDesignDocument(
  value: unknown,
): ComponentDesignDocument {
  const defaults = createDefaultComponentDesignDocument();

  if (!isPlainRecord(value)) {
    return defaults;
  }

  const components = isPlainRecord(value.components) ? value.components : {};

  return {
    components: {
      ContentCard: normalizeContentCardDesign(components.ContentCard),
      HighDensityInfoBlock: normalizeHighDensityInfoBlockDesign(
        components.HighDensityInfoBlock,
      ),
      RichParagraph: normalizeRichParagraphDesign(components.RichParagraph),
      TextSplitLayout: normalizeTextSplitLayoutDesign(components.TextSplitLayout),
    },
    version: COMPONENT_DESIGN_SCHEMA_VERSION,
  };
}

export function parseComponentDesignDocument(
  value: unknown,
): ComponentDesignDocument | null {
  if (!isPlainRecord(value)) {
    return null;
  }

  if (value.version !== COMPONENT_DESIGN_SCHEMA_VERSION) {
    return null;
  }

  const normalized = normalizeComponentDesignDocument(value);
  return normalized.version === COMPONENT_DESIGN_SCHEMA_VERSION ? normalized : null;
}

export const COMPONENT_DESIGN_SPACING_LABELS: Record<
  ComponentDesignSpacingToken,
  string
> = {
  "12": "12px",
  "16": "16px",
  "20": "20px",
  "24": "24px",
  "32": "32px",
  "48": "48px",
  "56": "56px",
  "64": "64px",
};

export const COMPONENT_DESIGN_SECTION_SPACING_LABELS: Record<
  ComponentDesignSectionSpacingToken,
  string
> = {
  block: "区块 / 128px",
  "block-compact": "区块紧凑 / 96px",
  "section-normal": "Section 常规",
  "section-spacious": "Section 宽松",
};
