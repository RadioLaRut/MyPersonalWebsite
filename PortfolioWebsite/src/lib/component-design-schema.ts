import type { TypographySize } from "@/lib/typography-tokens";

export const COMPONENT_DESIGN_SCHEMA_VERSION = 1 as const;

export const COMPONENT_DESIGN_COMPONENT_KEYS = [
  "HeroSection",
  "HeroHeadline",
  "PortfolioHeroHeader",
  "LightingCollectionHeader",
  "LightingProjectCard",
  "StatementBlock",
  "RichParagraph",
  "ContentCard",
  "TextSplitLayout",
  "HighDensityInfoBlock",
  "ImagePanel",
  "ImageSlider",
  "BreakdownHeadline",
  "BreakdownTriptych",
  "ParameterGrid",
  "ProjectSection",
  "WorksList",
  "WorksListEntry",
  "HomeEndcapSection",
  "NextProjectBlock",
  "ContactFlashlight",
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

export const COMPONENT_DESIGN_PARAMETER_ITEM_SPANS = [
  1,
  2,
  3,
  4,
  6,
  12,
] as const;

export type ComponentDesignComponentKey =
  (typeof COMPONENT_DESIGN_COMPONENT_KEYS)[number];

export type ComponentDesignSpacingToken =
  (typeof COMPONENT_DESIGN_SPACING_TOKENS)[number];

export type ComponentDesignSectionSpacingToken =
  (typeof COMPONENT_DESIGN_SECTION_SPACING_TOKENS)[number];

export type ComponentDesignParameterItemSpan =
  (typeof COMPONENT_DESIGN_PARAMETER_ITEM_SPANS)[number];

export type ComponentGridBounds = {
  leftCol: number;
  rightCol: number;
};

export type ComponentResponsiveGridBounds = {
  base: ComponentGridBounds;
  lg: ComponentGridBounds;
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
  leftBounds: ComponentGridBounds;
  middleBounds: ComponentGridBounds;
  phaseTitleGap: ComponentDesignSpacingToken;
  rightBounds: ComponentGridBounds;
  sectionSpacing: ComponentDesignSectionSpacingToken;
  subtitleAutoWrap: boolean;
  subtitleGap: ComponentDesignSpacingToken;
  titleAutoWrap: boolean;
  titleBodyGap: ComponentDesignSpacingToken;
  titleSize: TypographySize;
};

export type StatementBlockDesign = {
  bodyAutoWrap: boolean;
  bodySize: TypographySize;
  contentBounds: ComponentGridBounds;
};

export type HeroHeadlineDesign = {
  contentBounds: ComponentGridBounds;
};

export type ImagePanelDesign = {
  contentBounds: ComponentGridBounds;
  largeBounds: ComponentGridBounds;
  sectionSpacing: ComponentDesignSectionSpacingToken;
};

export type BreakdownHeadlineDesign = {
  contentBounds: ComponentGridBounds;
  sectionSpacing: ComponentDesignSectionSpacingToken;
  titleSize: TypographySize;
};

export type ImageSliderDesign = {
  contentBounds: ComponentGridBounds;
  labelsTopSpacing: ComponentDesignSpacingToken;
  sectionSpacing: ComponentDesignSectionSpacingToken;
};

export type BreakdownTriptychDesign = {
  col1Bounds: ComponentGridBounds;
  col2Bounds: ComponentGridBounds;
  col2TopSpacing: ComponentDesignSpacingToken;
  col3Bounds: ComponentGridBounds;
  col3TopSpacing: ComponentDesignSpacingToken;
  sectionSpacing: ComponentDesignSectionSpacingToken;
};

export type ParameterGridDesign = {
  itemSpan: ComponentDesignParameterItemSpan;
  mediaBottomSpacing: ComponentDesignSpacingToken;
  parametersBounds: ComponentGridBounds;
  sectionSpacing: ComponentDesignSectionSpacingToken;
};

export type ProjectSectionDesign = {
  textLeftBounds: ComponentResponsiveGridBounds;
  textRightBounds: ComponentResponsiveGridBounds;
};

export type HeroSectionDesign = {
  ctaTopSpacing: ComponentDesignSpacingToken;
  descriptionBounds: ComponentResponsiveGridBounds;
  titleBounds: ComponentResponsiveGridBounds;
};

export type HomeEndcapSectionDesign = {
  buttonTopSpacing: ComponentDesignSpacingToken;
  contentBounds: ComponentGridBounds;
  descriptionTopSpacing: ComponentDesignSpacingToken;
};

export type PortfolioHeroHeaderDesign = {
  ctaTopSpacing: ComponentDesignSpacingToken;
  descriptionTopSpacing: ComponentDesignSpacingToken;
  sideBounds: ComponentResponsiveGridBounds;
  singleColumnBounds: ComponentGridBounds;
  titleBounds: ComponentResponsiveGridBounds;
};

export type LightingCollectionHeaderDesign = {
  descriptionBounds: ComponentResponsiveGridBounds;
  titleBounds: ComponentResponsiveGridBounds;
  titleTopSpacing: ComponentDesignSpacingToken;
};

export type LightingProjectCardDesign = {
  contentBounds: ComponentGridBounds;
};

export type WorksListDesign = {
  headingBounds: ComponentGridBounds;
  headingBottomSpacing: ComponentDesignSpacingToken;
  sectionSpacing: ComponentDesignSectionSpacingToken;
};

export type WorksListEntryDesign = {
  numberBounds: ComponentResponsiveGridBounds;
  sidebarBounds: ComponentResponsiveGridBounds;
  titleBounds: ComponentResponsiveGridBounds;
};

export type NextProjectBlockDesign = {
  footerLeftBounds: ComponentResponsiveGridBounds;
  footerRightBounds: ComponentResponsiveGridBounds;
  footerTopSpacing: ComponentDesignSpacingToken;
  overlayBounds: ComponentGridBounds;
};

export type ContactFlashlightDesign = {
  contactBounds: ComponentGridBounds;
  detailBounds: ComponentGridBounds;
  heroBounds: ComponentGridBounds;
};

export type ComponentDesignDocument = {
  components: {
    BreakdownHeadline: BreakdownHeadlineDesign;
    BreakdownTriptych: BreakdownTriptychDesign;
    ContactFlashlight: ContactFlashlightDesign;
    ContentCard: ContentCardDesign;
    HeroHeadline: HeroHeadlineDesign;
    HeroSection: HeroSectionDesign;
    HighDensityInfoBlock: HighDensityInfoBlockDesign;
    HomeEndcapSection: HomeEndcapSectionDesign;
    ImagePanel: ImagePanelDesign;
    ImageSlider: ImageSliderDesign;
    LightingCollectionHeader: LightingCollectionHeaderDesign;
    LightingProjectCard: LightingProjectCardDesign;
    NextProjectBlock: NextProjectBlockDesign;
    ParameterGrid: ParameterGridDesign;
    PortfolioHeroHeader: PortfolioHeroHeaderDesign;
    ProjectSection: ProjectSectionDesign;
    RichParagraph: RichParagraphDesign;
    StatementBlock: StatementBlockDesign;
    TextSplitLayout: TextSplitLayoutDesign;
    WorksList: WorksListDesign;
    WorksListEntry: WorksListEntryDesign;
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

function isParameterItemSpan(
  value: unknown,
): value is ComponentDesignParameterItemSpan {
  return typeof value === "number" &&
    COMPONENT_DESIGN_PARAMETER_ITEM_SPANS.includes(
      value as ComponentDesignParameterItemSpan,
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

function createDefaultResponsiveBounds(
  baseLeftCol: number,
  baseRightCol: number,
  lgLeftCol = baseLeftCol,
  lgRightCol = baseRightCol,
): ComponentResponsiveGridBounds {
  return {
    base: createDefaultBounds(baseLeftCol, baseRightCol),
    lg: createDefaultBounds(lgLeftCol, lgRightCol),
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

function normalizeResponsiveBounds(
  value: unknown,
  fallback: ComponentResponsiveGridBounds,
): ComponentResponsiveGridBounds {
  if (!isPlainRecord(value)) {
    return fallback;
  }

  if ("leftCol" in value || "rightCol" in value) {
    const normalized = normalizeBounds(value, fallback.base);
    return {
      base: normalized,
      lg: normalized,
    };
  }

  return {
    base: normalizeBounds(value.base, fallback.base),
    lg: normalizeBounds(value.lg, fallback.lg),
  };
}

function normalizeTypographySize(
  value: unknown,
  fallback: TypographySize,
) {
  return isTypographySize(value) ? value : fallback;
}

function normalizeSpacingToken(
  value: unknown,
  fallback: ComponentDesignSpacingToken,
) {
  return isSpacingToken(value) ? value : fallback;
}

function normalizeSectionSpacingToken(
  value: unknown,
  fallback: ComponentDesignSectionSpacingToken,
) {
  return isSectionSpacingToken(value) ? value : fallback;
}

function normalizeParameterItemSpan(
  value: unknown,
  fallback: ComponentDesignParameterItemSpan,
) {
  return isParameterItemSpan(value) ? value : fallback;
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
    bodySize: normalizeTypographySize(value.bodySize, defaults.bodySize),
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
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
    bodySize: normalizeTypographySize(value.bodySize, defaults.bodySize),
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
    mobileMediaTopSpacing: normalizeSpacingToken(
      value.mobileMediaTopSpacing,
      defaults.mobileMediaTopSpacing,
    ),
    paragraphGap: normalizeSpacingToken(value.paragraphGap, defaults.paragraphGap),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
    textOnlyBounds: normalizeBounds(value.textOnlyBounds, defaults.textOnlyBounds),
    titleAutoWrap: isBoolean(value.titleAutoWrap)
      ? value.titleAutoWrap
      : defaults.titleAutoWrap,
    titleBodyGap: normalizeSpacingToken(
      value.titleBodyGap,
      defaults.titleBodyGap,
    ),
    titleSize: normalizeTypographySize(value.titleSize, defaults.titleSize),
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
    bodySize: normalizeTypographySize(value.bodySize, defaults.bodySize),
    headingAutoWrap: isBoolean(value.headingAutoWrap)
      ? value.headingAutoWrap
      : defaults.headingAutoWrap,
    headingImageGap: normalizeSpacingToken(
      value.headingImageGap,
      defaults.headingImageGap,
    ),
    paragraphGap: normalizeSpacingToken(value.paragraphGap, defaults.paragraphGap),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
    splitHeadingSize: normalizeTypographySize(
      value.splitHeadingSize,
      defaults.splitHeadingSize,
    ),
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
    stackHeadingSize: normalizeTypographySize(
      value.stackHeadingSize,
      defaults.stackHeadingSize,
    ),
    stackImageTopSpacing: normalizeSpacingToken(
      value.stackImageTopSpacing,
      defaults.stackImageTopSpacing,
    ),
    stackTextTopSpacing: normalizeSpacingToken(
      value.stackTextTopSpacing,
      defaults.stackTextTopSpacing,
    ),
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
    bodySize: normalizeTypographySize(value.bodySize, defaults.bodySize),
    imageTopSpacing: normalizeSpacingToken(
      value.imageTopSpacing,
      defaults.imageTopSpacing,
    ),
    itemsTopSpacing: normalizeSpacingToken(
      value.itemsTopSpacing,
      defaults.itemsTopSpacing,
    ),
    leftBounds: normalizeBounds(value.leftBounds, defaults.leftBounds),
    middleBounds: normalizeBounds(value.middleBounds, defaults.middleBounds),
    phaseTitleGap: normalizeSpacingToken(
      value.phaseTitleGap,
      defaults.phaseTitleGap,
    ),
    rightBounds: normalizeBounds(value.rightBounds, defaults.rightBounds),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
    subtitleAutoWrap: isBoolean(value.subtitleAutoWrap)
      ? value.subtitleAutoWrap
      : defaults.subtitleAutoWrap,
    subtitleGap: normalizeSpacingToken(value.subtitleGap, defaults.subtitleGap),
    titleAutoWrap: isBoolean(value.titleAutoWrap)
      ? value.titleAutoWrap
      : defaults.titleAutoWrap,
    titleBodyGap: normalizeSpacingToken(
      value.titleBodyGap,
      defaults.titleBodyGap,
    ),
    titleSize: normalizeTypographySize(value.titleSize, defaults.titleSize),
  };
}

function normalizeStatementBlockDesign(value: unknown): StatementBlockDesign {
  const defaults = createDefaultComponentDesignDocument().components.StatementBlock;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    bodyAutoWrap: isBoolean(value.bodyAutoWrap)
      ? value.bodyAutoWrap
      : defaults.bodyAutoWrap,
    bodySize: normalizeTypographySize(value.bodySize, defaults.bodySize),
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
  };
}

function normalizeHeroHeadlineDesign(value: unknown): HeroHeadlineDesign {
  const defaults = createDefaultComponentDesignDocument().components.HeroHeadline;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
  };
}

function normalizeImagePanelDesign(value: unknown): ImagePanelDesign {
  const defaults = createDefaultComponentDesignDocument().components.ImagePanel;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
    largeBounds: normalizeBounds(value.largeBounds, defaults.largeBounds),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
  };
}

function normalizeBreakdownHeadlineDesign(
  value: unknown,
): BreakdownHeadlineDesign {
  const defaults = createDefaultComponentDesignDocument().components.BreakdownHeadline;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
    titleSize: normalizeTypographySize(value.titleSize, defaults.titleSize),
  };
}

function normalizeImageSliderDesign(value: unknown): ImageSliderDesign {
  const defaults = createDefaultComponentDesignDocument().components.ImageSlider;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
    labelsTopSpacing: normalizeSpacingToken(
      value.labelsTopSpacing,
      defaults.labelsTopSpacing,
    ),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
  };
}

function normalizeBreakdownTriptychDesign(
  value: unknown,
): BreakdownTriptychDesign {
  const defaults = createDefaultComponentDesignDocument().components.BreakdownTriptych;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    col1Bounds: normalizeBounds(value.col1Bounds, defaults.col1Bounds),
    col2Bounds: normalizeBounds(value.col2Bounds, defaults.col2Bounds),
    col2TopSpacing: normalizeSpacingToken(
      value.col2TopSpacing,
      defaults.col2TopSpacing,
    ),
    col3Bounds: normalizeBounds(value.col3Bounds, defaults.col3Bounds),
    col3TopSpacing: normalizeSpacingToken(
      value.col3TopSpacing,
      defaults.col3TopSpacing,
    ),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
  };
}

function normalizeParameterGridDesign(value: unknown): ParameterGridDesign {
  const defaults = createDefaultComponentDesignDocument().components.ParameterGrid;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    itemSpan: normalizeParameterItemSpan(value.itemSpan, defaults.itemSpan),
    mediaBottomSpacing: normalizeSpacingToken(
      value.mediaBottomSpacing,
      defaults.mediaBottomSpacing,
    ),
    parametersBounds: normalizeBounds(
      value.parametersBounds,
      defaults.parametersBounds,
    ),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
  };
}

function normalizeProjectSectionDesign(value: unknown): ProjectSectionDesign {
  const defaults = createDefaultComponentDesignDocument().components.ProjectSection;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    textLeftBounds: normalizeResponsiveBounds(
      value.textLeftBounds,
      defaults.textLeftBounds,
    ),
    textRightBounds: normalizeResponsiveBounds(
      value.textRightBounds,
      defaults.textRightBounds,
    ),
  };
}

function normalizeHeroSectionDesign(value: unknown): HeroSectionDesign {
  const defaults = createDefaultComponentDesignDocument().components.HeroSection;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    ctaTopSpacing: normalizeSpacingToken(
      value.ctaTopSpacing,
      defaults.ctaTopSpacing,
    ),
    descriptionBounds: normalizeResponsiveBounds(
      value.descriptionBounds,
      defaults.descriptionBounds,
    ),
    titleBounds: normalizeResponsiveBounds(
      value.titleBounds,
      defaults.titleBounds,
    ),
  };
}

function normalizeHomeEndcapSectionDesign(
  value: unknown,
): HomeEndcapSectionDesign {
  const defaults = createDefaultComponentDesignDocument().components.HomeEndcapSection;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    buttonTopSpacing: normalizeSpacingToken(
      value.buttonTopSpacing,
      defaults.buttonTopSpacing,
    ),
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
    descriptionTopSpacing: normalizeSpacingToken(
      value.descriptionTopSpacing,
      defaults.descriptionTopSpacing,
    ),
  };
}

function normalizePortfolioHeroHeaderDesign(
  value: unknown,
): PortfolioHeroHeaderDesign {
  const defaults = createDefaultComponentDesignDocument().components.PortfolioHeroHeader;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    ctaTopSpacing: normalizeSpacingToken(
      value.ctaTopSpacing,
      defaults.ctaTopSpacing,
    ),
    descriptionTopSpacing: normalizeSpacingToken(
      value.descriptionTopSpacing,
      defaults.descriptionTopSpacing,
    ),
    sideBounds: normalizeResponsiveBounds(value.sideBounds, defaults.sideBounds),
    singleColumnBounds: normalizeBounds(
      value.singleColumnBounds,
      defaults.singleColumnBounds,
    ),
    titleBounds: normalizeResponsiveBounds(
      value.titleBounds,
      defaults.titleBounds,
    ),
  };
}

function normalizeLightingCollectionHeaderDesign(
  value: unknown,
): LightingCollectionHeaderDesign {
  const defaults = createDefaultComponentDesignDocument().components.LightingCollectionHeader;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    descriptionBounds: normalizeResponsiveBounds(
      value.descriptionBounds,
      defaults.descriptionBounds,
    ),
    titleBounds: normalizeResponsiveBounds(
      value.titleBounds,
      defaults.titleBounds,
    ),
    titleTopSpacing: normalizeSpacingToken(
      value.titleTopSpacing,
      defaults.titleTopSpacing,
    ),
  };
}

function normalizeLightingProjectCardDesign(
  value: unknown,
): LightingProjectCardDesign {
  const defaults = createDefaultComponentDesignDocument().components.LightingProjectCard;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    contentBounds: normalizeBounds(value.contentBounds, defaults.contentBounds),
  };
}

function normalizeWorksListDesign(value: unknown): WorksListDesign {
  const defaults = createDefaultComponentDesignDocument().components.WorksList;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    headingBounds: normalizeBounds(value.headingBounds, defaults.headingBounds),
    headingBottomSpacing: normalizeSpacingToken(
      value.headingBottomSpacing,
      defaults.headingBottomSpacing,
    ),
    sectionSpacing: normalizeSectionSpacingToken(
      value.sectionSpacing,
      defaults.sectionSpacing,
    ),
  };
}

function normalizeWorksListEntryDesign(value: unknown): WorksListEntryDesign {
  const defaults = createDefaultComponentDesignDocument().components.WorksListEntry;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    numberBounds: normalizeResponsiveBounds(
      value.numberBounds,
      defaults.numberBounds,
    ),
    sidebarBounds: normalizeResponsiveBounds(
      value.sidebarBounds,
      defaults.sidebarBounds,
    ),
    titleBounds: normalizeResponsiveBounds(
      value.titleBounds,
      defaults.titleBounds,
    ),
  };
}

function normalizeNextProjectBlockDesign(
  value: unknown,
): NextProjectBlockDesign {
  const defaults = createDefaultComponentDesignDocument().components.NextProjectBlock;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    footerLeftBounds: normalizeResponsiveBounds(
      value.footerLeftBounds,
      defaults.footerLeftBounds,
    ),
    footerRightBounds: normalizeResponsiveBounds(
      value.footerRightBounds,
      defaults.footerRightBounds,
    ),
    footerTopSpacing: normalizeSpacingToken(
      value.footerTopSpacing,
      defaults.footerTopSpacing,
    ),
    overlayBounds: normalizeBounds(value.overlayBounds, defaults.overlayBounds),
  };
}

function normalizeContactFlashlightDesign(
  value: unknown,
): ContactFlashlightDesign {
  const defaults = createDefaultComponentDesignDocument().components.ContactFlashlight;

  if (!isPlainRecord(value)) {
    return defaults;
  }

  return {
    contactBounds: normalizeBounds(value.contactBounds, defaults.contactBounds),
    detailBounds: normalizeBounds(value.detailBounds, defaults.detailBounds),
    heroBounds: normalizeBounds(value.heroBounds, defaults.heroBounds),
  };
}

export function createDefaultComponentDesignDocument(): ComponentDesignDocument {
  return {
    components: {
      BreakdownHeadline: {
        contentBounds: createDefaultBounds(1, 12),
        sectionSpacing: "block-compact",
        titleSize: "title",
      },
      BreakdownTriptych: {
        col1Bounds: createDefaultBounds(1, 4),
        col2Bounds: createDefaultBounds(5, 8),
        col2TopSpacing: "64",
        col3Bounds: createDefaultBounds(9, 12),
        col3TopSpacing: "64",
        sectionSpacing: "block-compact",
      },
      ContactFlashlight: {
        contactBounds: createDefaultBounds(4, 11),
        detailBounds: createDefaultBounds(4, 11),
        heroBounds: createDefaultBounds(3, 10),
      },
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
      HeroHeadline: {
        contentBounds: createDefaultBounds(2, 11),
      },
      HeroSection: {
        ctaTopSpacing: "48",
        descriptionBounds: createDefaultResponsiveBounds(1, 12, 10, 12),
        titleBounds: createDefaultResponsiveBounds(1, 12, 2, 8),
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
      HomeEndcapSection: {
        buttonTopSpacing: "48",
        contentBounds: createDefaultBounds(3, 10),
        descriptionTopSpacing: "32",
      },
      ImagePanel: {
        contentBounds: createDefaultBounds(2, 11),
        largeBounds: createDefaultBounds(2, 11),
        sectionSpacing: "block-compact",
      },
      ImageSlider: {
        contentBounds: createDefaultBounds(2, 11),
        labelsTopSpacing: "20",
        sectionSpacing: "block-compact",
      },
      LightingCollectionHeader: {
        descriptionBounds: createDefaultResponsiveBounds(1, 12, 10, 12),
        titleBounds: createDefaultResponsiveBounds(1, 12, 2, 9),
        titleTopSpacing: "20",
      },
      LightingProjectCard: {
        contentBounds: createDefaultBounds(2, 11),
      },
      NextProjectBlock: {
        footerLeftBounds: createDefaultResponsiveBounds(1, 12, 2, 6),
        footerRightBounds: createDefaultResponsiveBounds(1, 12, 8, 11),
        footerTopSpacing: "32",
        overlayBounds: createDefaultBounds(3, 10),
      },
      ParameterGrid: {
        itemSpan: 3,
        mediaBottomSpacing: "48",
        parametersBounds: createDefaultBounds(1, 12),
        sectionSpacing: "block",
      },
      PortfolioHeroHeader: {
        ctaTopSpacing: "48",
        descriptionTopSpacing: "24",
        sideBounds: createDefaultResponsiveBounds(1, 12, 10, 12),
        singleColumnBounds: createDefaultBounds(2, 11),
        titleBounds: createDefaultResponsiveBounds(1, 12, 2, 8),
      },
      ProjectSection: {
        textLeftBounds: createDefaultResponsiveBounds(1, 4, 2, 9),
        textRightBounds: createDefaultResponsiveBounds(1, 4, 5, 12),
      },
      RichParagraph: {
        bodyAutoWrap: true,
        bodySize: "body",
        contentBounds: createDefaultBounds(3, 10),
        sectionSpacing: "section-spacious",
      },
      StatementBlock: {
        bodyAutoWrap: true,
        bodySize: "body",
        contentBounds: createDefaultBounds(3, 10),
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
      WorksList: {
        headingBounds: createDefaultBounds(2, 11),
        headingBottomSpacing: "64",
        sectionSpacing: "section-normal",
      },
      WorksListEntry: {
        numberBounds: createDefaultResponsiveBounds(1, 1, 1, 1),
        sidebarBounds: createDefaultResponsiveBounds(9, 12, 9, 12),
        titleBounds: createDefaultResponsiveBounds(2, 11, 2, 8),
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
      BreakdownHeadline: normalizeBreakdownHeadlineDesign(
        components.BreakdownHeadline,
      ),
      BreakdownTriptych: normalizeBreakdownTriptychDesign(
        components.BreakdownTriptych,
      ),
      ContactFlashlight: normalizeContactFlashlightDesign(
        components.ContactFlashlight,
      ),
      ContentCard: normalizeContentCardDesign(components.ContentCard),
      HeroHeadline: normalizeHeroHeadlineDesign(components.HeroHeadline),
      HeroSection: normalizeHeroSectionDesign(components.HeroSection),
      HighDensityInfoBlock: normalizeHighDensityInfoBlockDesign(
        components.HighDensityInfoBlock,
      ),
      HomeEndcapSection: normalizeHomeEndcapSectionDesign(
        components.HomeEndcapSection,
      ),
      ImagePanel: normalizeImagePanelDesign(components.ImagePanel),
      ImageSlider: normalizeImageSliderDesign(components.ImageSlider),
      LightingCollectionHeader: normalizeLightingCollectionHeaderDesign(
        components.LightingCollectionHeader,
      ),
      LightingProjectCard: normalizeLightingProjectCardDesign(
        components.LightingProjectCard,
      ),
      NextProjectBlock: normalizeNextProjectBlockDesign(
        components.NextProjectBlock,
      ),
      ParameterGrid: normalizeParameterGridDesign(components.ParameterGrid),
      PortfolioHeroHeader: normalizePortfolioHeroHeaderDesign(
        components.PortfolioHeroHeader,
      ),
      ProjectSection: normalizeProjectSectionDesign(components.ProjectSection),
      RichParagraph: normalizeRichParagraphDesign(components.RichParagraph),
      StatementBlock: normalizeStatementBlockDesign(components.StatementBlock),
      TextSplitLayout: normalizeTextSplitLayoutDesign(
        components.TextSplitLayout,
      ),
      WorksList: normalizeWorksListDesign(components.WorksList),
      WorksListEntry: normalizeWorksListEntryDesign(components.WorksListEntry),
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

export const COMPONENT_DESIGN_PARAMETER_ITEM_SPAN_LABELS: Record<
  ComponentDesignParameterItemSpan,
  string
> = {
  1: "1 列",
  2: "2 列",
  3: "3 列",
  4: "4 列",
  6: "6 列",
  12: "12 列",
};
