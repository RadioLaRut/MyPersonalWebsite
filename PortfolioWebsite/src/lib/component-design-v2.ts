import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  COMPONENT_DESIGN_MANIFEST,
  COMPONENT_DESIGN_MANIFEST_BY_COMPONENT,
  getComponentDesignVariantDescriptor,
  type ComponentDesignAuthorComponent,
  type ComponentDesignNodeDescriptor,
} from "./component-design-manifest.ts";
import {
  createDefaultComponentDesignDocument as createDefaultLegacyComponentDesignDocument,
  parseComponentDesignDocument as parseLegacyComponentDesignDocument,
  type ComponentDesignDocument as LegacyComponentDesignDocument,
  type ComponentGridBounds,
  type ComponentResponsiveGridBounds,
} from "./component-design-schema.ts";
import {
  isTypographyAlignment,
  type TypographyAlignment,
} from "./typography-alignment.ts";
import {
  TYPOGRAPHY_PRESETS,
  TYPOGRAPHY_SIZES,
  TYPOGRAPHY_WRAP_POLICIES,
  getTypographyFontLabSizes,
  isTypographyFontLabSizeSupported,
  type TypographyPreset,
  type TypographySize,
  type TypographyWrapPolicy,
} from "./typography-tokens.ts";
import { areJsonStructuresEqual, isPlainRecord } from "./json-utils.ts";

export const COMPONENT_DESIGN_SCHEMA_VERSION = 2 as const;

export const COMPONENT_DESIGN_BREAKPOINTS = [
  "desktop",
  "tablet",
  "mobile",
] as const;

export const COMPONENT_DESIGN_RHYTHM_TOKENS = [
  0,
  8,
  16,
  24,
  32,
  48,
  64,
] as const;

export const COMPONENT_DESIGN_OPTICAL_PULL_TOKENS = [
  0,
  4,
  8,
  12,
] as const;

export const COMPONENT_DESIGN_SECTION_PROFILES = [
  "compact",
  "normal",
  "spacious",
  "hero",
] as const;

export type ComponentDesignBreakpoint =
  (typeof COMPONENT_DESIGN_BREAKPOINTS)[number];

export type ComponentDesignRhythmToken =
  (typeof COMPONENT_DESIGN_RHYTHM_TOKENS)[number];

export type ComponentDesignOpticalPullToken =
  (typeof COMPONENT_DESIGN_OPTICAL_PULL_TOKENS)[number];

export type ComponentDesignSectionProfile =
  (typeof COMPONENT_DESIGN_SECTION_PROFILES)[number];

export type ComponentGridPlacement = {
  span: number;
  start: number;
};

export type ComponentResponsiveValue<Value> = Record<
  ComponentDesignBreakpoint,
  Value
>;

export type ComponentNodeTypography = {
  preset: TypographyPreset;
  size: TypographySize;
  wrap: TypographyWrapPolicy;
};

export type ComponentDesignRuntimeSectionHeight =
  | "auto"
  | "compact"
  | "normal"
  | "tall"
  | "viewport";

export type ComponentDesignRuntimeMediaFrame =
  | "auto"
  | "square"
  | "portrait"
  | "landscape"
  | "wide"
  | "cinematic"
  | "viewport";

export type ComponentDesignRuntimeNodePositioning =
  | {
    gapBefore: ComponentDesignRhythmToken;
    mode: "flow";
    order: number;
  }
  | {
    anchor: "top" | "center" | "bottom";
    anchored?: true;
    mode: "overlay";
    offset: number;
  };

export type ComponentDesignRuntimeSectionLayout = {
  gap: number;
  height: ComponentDesignRuntimeSectionHeight;
  paddingBottom: number;
  paddingTop: number;
  profile: ComponentDesignSectionProfile;
};

export type ComponentLayoutNode = {
  alignment?: ComponentResponsiveValue<TypographyAlignment>;
  bleed?: "none" | "viewport";
  mediaFrame?: ComponentResponsiveValue<ComponentDesignRuntimeMediaFrame>;
  opticalPull?: ComponentDesignOpticalPullToken;
  placement: ComponentResponsiveValue<ComponentGridPlacement>;
  positioning?: ComponentResponsiveValue<ComponentDesignRuntimeNodePositioning>;
  responsiveTypography?: ComponentResponsiveValue<ComponentNodeTypography>;
  typography?: ComponentNodeTypography;
};

export type ComponentVariantLayout = {
  componentLabAnnotations?: true;
  gaps: Record<string, ComponentResponsiveValue<ComponentDesignRhythmToken>>;
  nodes: Record<string, ComponentLayoutNode>;
  section?: ComponentResponsiveValue<ComponentDesignRuntimeSectionLayout>;
  sectionProfile: ComponentDesignSectionProfile;
};

export type ComponentDesignEntry = {
  variants: Record<string, ComponentVariantLayout>;
};

export type ComponentDesignDocumentV2 = {
  components: Record<ComponentDesignAuthorComponent, ComponentDesignEntry>;
  version: typeof COMPONENT_DESIGN_SCHEMA_VERSION;
};

export type ComponentDesignDocument = ComponentDesignDocumentV2;

export const COMPONENT_DESIGN_SECTION_PROFILE_VALUES = {
  compact: {
    desktop: { bottom: 64, top: 64 },
    mobile: { bottom: 48, top: 48 },
    tablet: { bottom: 64, top: 64 },
  },
  normal: {
    desktop: { bottom: 96, top: 96 },
    mobile: { bottom: 64, top: 64 },
    tablet: { bottom: 80, top: 80 },
  },
  spacious: {
    desktop: { bottom: 128, top: 128 },
    mobile: { bottom: 80, top: 80 },
    tablet: { bottom: 96, top: 96 },
  },
  hero: {
    desktop: { bottom: 128, top: 160 },
    mobile: { bottom: 64, top: 96 },
    tablet: { bottom: 96, top: 128 },
  },
} as const satisfies Record<
  ComponentDesignSectionProfile,
  ComponentResponsiveValue<{ bottom: number; top: number }>
>;

function clone<Value>(value: Value): Value {
  return JSON.parse(JSON.stringify(value)) as Value;
}

function placement(start: number, span: number): ComponentGridPlacement {
  return { span, start };
}

function responsive<Value>(
  mobile: Value,
  tablet: Value = mobile,
  desktop: Value = tablet,
): ComponentResponsiveValue<Value> {
  return {
    desktop: clone(desktop),
    mobile: clone(mobile),
    tablet: clone(tablet),
  };
}

function shared<Value>(value: Value): ComponentResponsiveValue<Value> {
  return responsive(value, value, value);
}

function fromBounds(bounds: ComponentGridBounds): ComponentGridPlacement {
  return placement(bounds.leftCol, bounds.rightCol - bounds.leftCol + 1);
}

function fromResponsiveBounds(
  bounds: ComponentResponsiveGridBounds,
): ComponentResponsiveValue<ComponentGridPlacement> {
  return responsive(
    fromBounds(bounds.base),
    fromBounds(bounds.md),
    fromBounds(bounds.lg),
  );
}

function sharedBounds(
  bounds: ComponentGridBounds,
): ComponentResponsiveValue<ComponentGridPlacement> {
  return shared(fromBounds(bounds));
}

function alignment(
  value: TypographyAlignment,
): ComponentResponsiveValue<TypographyAlignment> {
  return shared(value);
}

function rhythm(
  value: ComponentDesignRhythmToken,
): ComponentResponsiveValue<ComponentDesignRhythmToken> {
  return shared(value);
}

function legacySpacingToRhythm(
  value: string,
  fallback: ComponentDesignRhythmToken = 24,
): ComponentDesignRhythmToken {
  const numeric = Number(value);
  if (
    COMPONENT_DESIGN_RHYTHM_TOKENS.includes(
      numeric as ComponentDesignRhythmToken,
    )
  ) {
    return numeric as ComponentDesignRhythmToken;
  }

  if (numeric === 12) return 16;
  if (numeric === 20) return 24;
  if (numeric === 56) return 64;
  return fallback;
}

function legacySectionToProfile(
  value: string,
): ComponentDesignSectionProfile {
  switch (value) {
    case "section-spacious":
      return "spacious";
    case "section-normal":
    case "block":
      return "normal";
    case "block-compact":
    default:
      return "compact";
  }
}

function nodeFromDescriptor(
  descriptor: ComponentDesignNodeDescriptor,
  nodePlacement = shared(placement(1, 12)),
): ComponentLayoutNode {
  return {
    ...(descriptor.alignment ? { alignment: alignment("left") } : {}),
    ...(descriptor.bleed ? { bleed: descriptor.bleed } : {}),
    ...(descriptor.opticalPull ? { opticalPull: 0 as const } : {}),
    placement: clone(nodePlacement),
    ...(descriptor.typography
      ? { typography: clone(descriptor.typography) }
      : {}),
  };
}

function emptyVariant(
  component: ComponentDesignAuthorComponent,
  variant: string,
  sectionProfile: ComponentDesignSectionProfile = "normal",
): ComponentVariantLayout {
  const descriptor = getComponentDesignVariantDescriptor(component, variant);
  const gapPairs = new Set<string>();
  descriptor.nodes.forEach((node, targetIndex) => {
    for (let sourceIndex = targetIndex - 1; sourceIndex >= 0; sourceIndex -= 1) {
      const source = descriptor.nodes[sourceIndex];
      gapPairs.add(`${source.id}>${node.id}`);
      if (!source.optional) break;
    }
    if (node.repeated) gapPairs.add(`${node.id}>${node.id}`);
  });
  return {
    gaps: Object.fromEntries(
      [...gapPairs].map((pair) => [pair, rhythm(0)]),
    ),
    nodes: Object.fromEntries(
      descriptor.nodes.map((node) => [node.id, nodeFromDescriptor(node)]),
    ),
    sectionProfile,
  };
}

function setNodePlacement(
  layout: ComponentVariantLayout,
  nodeIds: readonly string[],
  value: ComponentResponsiveValue<ComponentGridPlacement>,
) {
  nodeIds.forEach((nodeId) => {
    const node = layout.nodes[nodeId];
    if (node) node.placement = clone(value);
  });
}

function setNodeAlignment(
  layout: ComponentVariantLayout,
  nodeIds: readonly string[],
  value: TypographyAlignment,
) {
  nodeIds.forEach((nodeId) => {
    const node = layout.nodes[nodeId];
    if (node?.alignment) node.alignment = alignment(value);
  });
}

function setNodeTypography(
  layout: ComponentVariantLayout,
  nodeId: string,
  patch: Partial<ComponentNodeTypography>,
) {
  const typography = layout.nodes[nodeId]?.typography;
  if (!typography) return;
  layout.nodes[nodeId].typography = { ...typography, ...patch };
}

function setGap(
  layout: ComponentVariantLayout,
  from: string,
  to: string,
  value: ComponentDesignRhythmToken,
) {
  layout.gaps[`${from}>${to}`] = rhythm(value);
}

function createEmptyDocument(): ComponentDesignDocumentV2 {
  return {
    components: Object.fromEntries(
      COMPONENT_DESIGN_MANIFEST.map((entry) => [
        entry.component,
        {
          variants: Object.fromEntries(
            entry.variants.map((variant) => [
              variant.id,
              emptyVariant(entry.component, variant.id),
            ]),
          ),
        },
      ]),
    ) as ComponentDesignDocumentV2["components"],
    version: COMPONENT_DESIGN_SCHEMA_VERSION,
  };
}

function migrateHeroSection(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const source = legacy.components.HeroSection;
  const mediaPlacement = shared(placement(1, 12));
  const contentPlacement = fromResponsiveBounds(source.contentBounds);
  for (const variant of ["poster", "full"] as const) {
    const layout = document.components.HeroSection.variants[variant];
    setNodePlacement(layout, ["media"], mediaPlacement);
    setNodePlacement(
      layout,
      Object.keys(layout.nodes).filter((nodeId) => nodeId !== "media"),
      contentPlacement,
    );
    layout.sectionProfile = "hero";
  }

  const poster = document.components.HeroSection.variants.poster;
  setNodeAlignment(poster, ["title", "subtitle", "positioning", "eyebrow"], "right");
  setGap(
    poster,
    "title",
    "positioning",
    legacySpacingToRhythm(source.eyebrowTopSpacing, 16),
  );
  setGap(
    poster,
    "positioning",
    "eyebrow",
    legacySpacingToRhythm(source.eyebrowTopSpacing, 16),
  );

  const full = document.components.HeroSection.variants.full;
  setGap(full, "eyebrow", "title", 16);
  setGap(full, "title", "subtitle", 16);
  setGap(full, "subtitle", "description", 16);
  setGap(
    full,
    "description",
    "primaryCta",
    legacySpacingToRhythm(source.ctaTopSpacing, 48),
  );
  setGap(full, "title", "primaryCta", 32);
}

function migrateHeroHeadline(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const layout = document.components.HeroHeadline.variants.default;
  const contentPlacement = sharedBounds(legacy.components.HeroHeadline.contentBounds);
  setNodePlacement(layout, ["media"], shared(placement(1, 12)));
  setNodePlacement(layout, ["eyebrow", "title", "subtitle", "navLink"], contentPlacement);
  layout.sectionProfile = "hero";
  setGap(layout, "eyebrow", "title", 16);
  setGap(layout, "title", "subtitle", 24);
  setGap(layout, "subtitle", "navLink", 24);
}

function migrateEditorialHeader(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const indexSource = legacy.components.PortfolioHeroHeader;
  const index = document.components.EditorialHeader.variants.index;
  setNodePlacement(index, ["title", "subtitle"], fromResponsiveBounds(indexSource.titleBounds));
  setNodePlacement(
    index,
    ["sideEyebrow", "description", "cta"],
    fromResponsiveBounds(indexSource.sideBounds),
  );
  index.sectionProfile = "hero";
  setGap(index, "sideEyebrow", "description", legacySpacingToRhythm(indexSource.descriptionTopSpacing));
  setGap(index, "description", "cta", legacySpacingToRhythm(indexSource.ctaTopSpacing));

  const collectionSource = legacy.components.LightingCollectionHeader;
  const collection = document.components.EditorialHeader.variants.collection;
  setNodePlacement(
    collection,
    ["backLink", "number", "title"],
    fromResponsiveBounds(collectionSource.titleBounds),
  );
  setNodePlacement(
    collection,
    ["description"],
    fromResponsiveBounds(collectionSource.descriptionBounds),
  );
  setNodeAlignment(collection, ["description"], "right");
  collection.sectionProfile = "hero";
  setGap(
    collection,
    "number",
    "title",
    legacySpacingToRhythm(collectionSource.titleTopSpacing),
  );
}

function migrateEditorialSplit(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const card = legacy.components.ContentCard;
  const split = legacy.components.TextSplitLayout;
  const left = document.components.EditorialSplit.variants["media-left"];
  setNodePlacement(left, ["media"], sharedBounds(card.imageLeftMediaBounds));
  setNodePlacement(
    left,
    ["heading", "body", "body.item"],
    sharedBounds(card.imageLeftTextBounds),
  );
  left.sectionProfile = legacySectionToProfile(card.sectionSpacing);
  setNodeTypography(left, "heading", { size: card.titleSize });
  setNodeTypography(left, "body", {
    size: card.bodySize,
    wrap: card.bodyAutoWrap ? "prose" : "nowrap",
  });
  setNodeTypography(left, "body.item", {
    size: split.bodySize,
    wrap: split.bodyAutoWrap ? "prose" : "nowrap",
  });
  setGap(left, "heading", "body", legacySpacingToRhythm(card.titleBodyGap));
  setGap(left, "body.item", "body.item", legacySpacingToRhythm(card.paragraphGap));

  const right = clone(left);
  setNodePlacement(right, ["media"], sharedBounds(card.imageRightMediaBounds));
  setNodePlacement(
    right,
    ["heading", "body", "body.item"],
    sharedBounds(card.imageRightTextBounds),
  );
  document.components.EditorialSplit.variants["media-right"] = right;

  const stack = document.components.EditorialSplit.variants.stack;
  setNodePlacement(
    stack,
    ["media", "heading", "body", "body.item"],
    sharedBounds(split.stackBounds),
  );
  stack.sectionProfile = legacySectionToProfile(split.sectionSpacing);
  setNodeAlignment(stack, ["heading", "body", "body.item"], "center");
  setNodeTypography(stack, "heading", {
    size: split.stackHeadingSize,
    wrap: split.headingAutoWrap ? "heading" : "nowrap",
  });
  setNodeTypography(stack, "body", {
    size: split.bodySize,
    wrap: split.bodyAutoWrap ? "prose" : "nowrap",
  });
  setNodeTypography(stack, "body.item", {
    size: split.bodySize,
    wrap: split.bodyAutoWrap ? "prose" : "nowrap",
  });
  setGap(
    stack,
    "heading",
    "body",
    legacySpacingToRhythm(split.stackTextTopSpacing),
  );
  setGap(
    stack,
    "body.item",
    "body.item",
    legacySpacingToRhythm(split.paragraphGap),
  );
  setGap(
    stack,
    "body",
    "media",
    legacySpacingToRhythm(split.stackImageTopSpacing),
  );
}

function migrateThreeColumnSection(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const phaseSource = legacy.components.HighDensityInfoBlock;
  const phase = document.components.ThreeColumnSection.variants.phase;
  const phaseBounds = [
    phaseSource.leftBounds,
    phaseSource.middleBounds,
    phaseSource.rightBounds,
  ];
  phaseBounds.forEach((bounds, index) => {
    const prefix = `column${index + 1}`;
    setNodePlacement(
      phase,
      Object.keys(phase.nodes).filter((nodeId) => nodeId.startsWith(prefix)),
      sharedBounds(bounds),
    );
  });
  phase.sectionProfile = legacySectionToProfile(phaseSource.sectionSpacing);
  for (const column of [1, 2, 3]) {
    setNodeTypography(phase, `column${column}.title`, {
      size: phaseSource.titleSize,
      wrap: phaseSource.titleAutoWrap ? "heading" : "nowrap",
    });
    setNodeTypography(phase, `column${column}.body`, {
      size: phaseSource.bodySize,
      wrap: phaseSource.bodyAutoWrap ? "prose" : "nowrap",
    });
    setGap(
      phase,
      `column${column}.title`,
      `column${column}.subtitle`,
      legacySpacingToRhythm(phaseSource.phaseTitleGap),
    );
    setGap(
      phase,
      `column${column}.subtitle`,
      `column${column}.body`,
      legacySpacingToRhythm(phaseSource.subtitleGap),
    );
    setGap(
      phase,
      `column${column}.body`,
      `column${column}.item.label`,
      legacySpacingToRhythm(phaseSource.itemsTopSpacing),
    );
    setGap(
      phase,
      `column${column}.body`,
      `column${column}.media`,
      legacySpacingToRhythm(phaseSource.imageTopSpacing),
    );
  }

  const triptychSource = legacy.components.BreakdownTriptych;
  const triptych = document.components.ThreeColumnSection.variants.triptych;
  [
    triptychSource.col1Bounds,
    triptychSource.col2Bounds,
    triptychSource.col3Bounds,
  ].forEach((bounds, index) => {
    const prefix = `column${index + 1}`;
    setNodePlacement(
      triptych,
      Object.keys(triptych.nodes).filter((nodeId) => nodeId.startsWith(prefix)),
      sharedBounds(bounds),
    );
  });
  triptych.sectionProfile = legacySectionToProfile(triptychSource.sectionSpacing);
  setGap(
    triptych,
    "column1",
    "column2",
    legacySpacingToRhythm(triptychSource.col2TopSpacing),
  );
  setGap(
    triptych,
    "column2",
    "column3",
    legacySpacingToRhythm(triptychSource.col3TopSpacing),
  );
}

function migrateStatementBlock(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const source = legacy.components.StatementBlock;
  for (const variant of ["small", "medium", "large"] as const) {
    const layout = document.components.StatementBlock.variants[variant];
    setNodePlacement(layout, ["content"], sharedBounds(source.contentBounds));
    setNodeAlignment(layout, ["content"], "center");
    setNodeTypography(layout, "content", {
      size: source.bodySize,
      wrap: source.bodyAutoWrap ? "prose" : "nowrap",
    });
    layout.sectionProfile =
      variant === "large" ? "spacious" : variant === "small" ? "compact" : "normal";
  }
}

function migrateSimpleComponents(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const rich = document.components.RichParagraph.variants.default;
  const richSource = legacy.components.RichParagraph;
  setNodePlacement(rich, ["body"], sharedBounds(richSource.contentBounds));
  setNodeAlignment(rich, ["body"], "justify");
  setNodeTypography(rich, "body", {
    size: richSource.bodySize,
    wrap: richSource.bodyAutoWrap ? "prose" : "nowrap",
  });
  rich.sectionProfile = legacySectionToProfile(richSource.sectionSpacing);

  const imageSource = legacy.components.ImagePanel;
  for (const variant of ["content", "large", "fullscreen"] as const) {
    const image = document.components.ImagePanel.variants[variant];
    const bounds = variant === "large"
      ? imageSource.largeBounds
      : variant === "fullscreen"
        ? { leftCol: 1, rightCol: 12 }
        : imageSource.contentBounds;
    setNodePlacement(image, ["media", "caption"], sharedBounds(bounds));
    image.sectionProfile = legacySectionToProfile(imageSource.sectionSpacing);
  }
  document.components.ImagePanel.variants.fullscreen.nodes.media.bleed = "viewport";

  const bilibili = document.components.BilibiliEmbed.variants.default;
  setNodePlacement(
    bilibili,
    ["player", "caption", "externalLink"],
    shared(placement(2, 10)),
  );
  bilibili.sectionProfile = "normal";

  const sliderSource = legacy.components.ImageSlider;
  const slider = document.components.ImageSlider.variants.default;
  setNodePlacement(
    slider,
    Object.keys(slider.nodes),
    sharedBounds(sliderSource.contentBounds),
  );
  slider.sectionProfile = legacySectionToProfile(sliderSource.sectionSpacing);
  setGap(
    slider,
    "media",
    "leftLabel",
    legacySpacingToRhythm(sliderSource.labelsTopSpacing),
  );

  const breakdownSource = legacy.components.BreakdownHeadline;
  for (const variant of ["chapter", "section"] as const) {
    const breakdown = document.components.BreakdownHeadline.variants[variant];
    setNodePlacement(
      breakdown,
      ["index", "title"],
      sharedBounds(breakdownSource.contentBounds),
    );
    breakdown.sectionProfile = legacySectionToProfile(
      breakdownSource.sectionSpacing,
    );
    setNodeTypography(breakdown, "title", {
      size: variant === "chapter" ? "display" : breakdownSource.titleSize,
    });
  }
}

function migrateProjectCoverLink(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const cardSource = legacy.components.LightingProjectCard;
  const card = document.components.ProjectCoverLink.variants.card;
  setNodePlacement(card, ["media"], shared(placement(1, 12)));
  setNodePlacement(
    card,
    ["number", "prompt", "title"],
    sharedBounds(cardSource.contentBounds),
  );
  card.sectionProfile = "normal";

  const immersiveSource = legacy.components.ProjectSection;
  for (const variant of ["immersive-left", "immersive-right"] as const) {
    const layout = document.components.ProjectCoverLink.variants[variant];
    const textBounds = variant === "immersive-right"
      ? immersiveSource.textRightBounds
      : immersiveSource.textLeftBounds;
    setNodePlacement(layout, ["media"], shared(placement(1, 12)));
    setNodePlacement(layout, ["subtitle", "title", "underline"], fromResponsiveBounds(textBounds));
    setNodeAlignment(
      layout,
      ["subtitle", "title"],
      variant === "immersive-right" ? "right" : "left",
    );
    setNodeTypography(layout, "title", { size: immersiveSource.titleSize });
    layout.nodes.title.opticalPull = Number(
      immersiveSource.titleUnderlineOpticalPull,
    ) as ComponentDesignOpticalPullToken;
    layout.sectionProfile = "normal";
    setGap(
      layout,
      "subtitle",
      "title",
      legacySpacingToRhythm(immersiveSource.lockupGap, 16),
    );
    setGap(
      layout,
      "title",
      "underline",
      legacySpacingToRhythm(immersiveSource.lockupGap, 16),
    );
  }
}

function migrateWorksAndParameters(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const worksSource = legacy.components.WorksList;
  const entrySource = legacy.components.WorksListEntry;
  const works = document.components.WorksList.variants.default;
  setNodePlacement(works, ["heading", "indexSummary"], sharedBounds(worksSource.headingBounds));
  setNodePlacement(works, ["item.number"], fromResponsiveBounds(entrySource.numberBounds));
  setNodePlacement(works, ["item.title"], fromResponsiveBounds(entrySource.titleBounds));
  setNodePlacement(
    works,
    ["item.category", "item.description", "item.media"],
    fromResponsiveBounds(entrySource.sidebarBounds),
  );
  works.sectionProfile = legacySectionToProfile(worksSource.sectionSpacing);
  setGap(
    works,
    "heading",
    "item.number",
    legacySpacingToRhythm(worksSource.headingBottomSpacing),
  );

  const parameterSource = legacy.components.ParameterGrid;
  const parameters = document.components.ParameterGrid.variants.default;
  setNodePlacement(parameters, ["media", "mediaLabel"], shared(placement(1, 12)));
  setNodePlacement(parameters, ["items"], sharedBounds(parameterSource.parametersBounds));
  const parameterStart = parameterSource.parametersBounds.leftCol;
  const parameterSpan = Math.min(
    parameterSource.itemSpan,
    parameterSource.parametersBounds.rightCol - parameterStart + 1,
  );
  setNodePlacement(
    parameters,
    ["item.name", "item.value", "item.description"],
    shared(placement(parameterStart, parameterSpan)),
  );
  parameters.sectionProfile = legacySectionToProfile(
    parameterSource.sectionSpacing,
  );
  setGap(
    parameters,
    "media",
    "items",
    legacySpacingToRhythm(parameterSource.mediaBottomSpacing),
  );
}

function migrateEndingComponents(
  document: ComponentDesignDocumentV2,
  legacy: LegacyComponentDesignDocument,
) {
  const nextSource = legacy.components.NextProjectBlock;
  const next = document.components.NextProjectBlock.variants.default;
  setNodePlacement(next, ["media"], shared(placement(1, 12)));
  setNodePlacement(next, ["eyebrow", "title"], sharedBounds(nextSource.overlayBounds));
  setNodePlacement(next, ["footerLeft"], fromResponsiveBounds(nextSource.footerLeftBounds));
  setNodePlacement(next, ["footerRight"], fromResponsiveBounds(nextSource.footerRightBounds));
  next.sectionProfile = "hero";
  setGap(
    next,
    "title",
    "footerLeft",
    legacySpacingToRhythm(nextSource.footerTopSpacing),
  );

  const endcapSource = legacy.components.HomeEndcapSection;
  const endcap = document.components.HomeEndcapSection.variants.default;
  setNodePlacement(
    endcap,
    ["eyebrow", "title", "description", "cta"],
    sharedBounds(endcapSource.contentBounds),
  );
  setNodeAlignment(endcap, ["eyebrow", "title", "description", "cta"], "center");
  setNodeTypography(endcap, "title", { size: endcapSource.titleSize });
  endcap.sectionProfile = "spacious";
  setGap(
    endcap,
    "title",
    "description",
    legacySpacingToRhythm(endcapSource.descriptionTopSpacing),
  );
  setGap(
    endcap,
    "description",
    "cta",
    legacySpacingToRhythm(endcapSource.buttonTopSpacing),
  );
  setGap(endcap, "title", "cta", 32);

  const contactSource = legacy.components.ContactFlashlight;
  const contact = document.components.ContactFlashlight.variants.default;
  setNodePlacement(
    contact,
    ["name", "tagline", "taglineSub"],
    sharedBounds(contactSource.heroBounds),
  );
  setNodePlacement(
    contact,
    ["clientsHeading", "clients.item", "employmentHeading", "employment.item"],
    sharedBounds(contactSource.detailBounds),
  );
  setNodePlacement(
    contact,
    ["contactHeading", "emailHeading", "wechat", "copyPrompt", "email"],
    sharedBounds(contactSource.contactBounds),
  );
  contact.sectionProfile = "spacious";
}

export function migrateLegacyComponentDesignDocument(
  legacy: LegacyComponentDesignDocument,
): ComponentDesignDocumentV2 {
  const document = createEmptyDocument();
  migrateHeroSection(document, legacy);
  migrateHeroHeadline(document, legacy);
  migrateEditorialHeader(document, legacy);
  migrateEditorialSplit(document, legacy);
  migrateThreeColumnSection(document, legacy);
  migrateStatementBlock(document, legacy);
  migrateSimpleComponents(document, legacy);
  migrateProjectCoverLink(document, legacy);
  migrateWorksAndParameters(document, legacy);
  migrateEndingComponents(document, legacy);
  return document;
}

export function createDefaultComponentDesignDocument(): ComponentDesignDocumentV2 {
  return migrateLegacyComponentDesignDocument(
    createDefaultLegacyComponentDesignDocument(),
  );
}

function isFiniteInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) &&
    Number.isInteger(value);
}

export function isGridPlacement(value: unknown): value is ComponentGridPlacement {
  if (!isPlainRecord(value)) return false;
  const keys = Object.keys(value).sort();
  if (keys.length !== 2 || keys[0] !== "span" || keys[1] !== "start") {
    return false;
  }
  if (!isFiniteInteger(value.start) || !isFiniteInteger(value.span)) return false;
  return value.start >= 1 && value.start <= 12 &&
    value.span >= 1 && value.start + value.span <= 13;
}

function normalizePlacement(
  value: unknown,
  fallback: ComponentGridPlacement,
): ComponentGridPlacement {
  return isGridPlacement(value) ? value : clone(fallback);
}

function normalizeResponsiveValue<Value>(
  value: unknown,
  fallback: ComponentResponsiveValue<Value>,
  normalizeValue: (candidate: unknown, fallbackValue: Value) => Value,
): ComponentResponsiveValue<Value> {
  const source = isPlainRecord(value) ? value : {};
  return {
    desktop: normalizeValue(source.desktop, fallback.desktop),
    mobile: normalizeValue(source.mobile, fallback.mobile),
    tablet: normalizeValue(source.tablet, fallback.tablet),
  };
}

function normalizeAlignment(
  value: unknown,
  fallback: TypographyAlignment,
): TypographyAlignment {
  return isTypographyAlignment(value) ? value : fallback;
}

function normalizeRhythm(
  value: unknown,
  fallback: ComponentDesignRhythmToken,
): ComponentDesignRhythmToken {
  return typeof value === "number" &&
      COMPONENT_DESIGN_RHYTHM_TOKENS.includes(value as ComponentDesignRhythmToken)
    ? value as ComponentDesignRhythmToken
    : fallback;
}

function normalizeOpticalPull(
  value: unknown,
  fallback: ComponentDesignOpticalPullToken,
): ComponentDesignOpticalPullToken {
  return typeof value === "number" &&
      COMPONENT_DESIGN_OPTICAL_PULL_TOKENS.includes(
        value as ComponentDesignOpticalPullToken,
      )
    ? value as ComponentDesignOpticalPullToken
    : fallback;
}

const COMPONENT_DESIGN_RUNTIME_SECTION_HEIGHTS = [
  "auto",
  "compact",
  "normal",
  "tall",
  "viewport",
] as const satisfies readonly ComponentDesignRuntimeSectionHeight[];

const COMPONENT_DESIGN_RUNTIME_MEDIA_FRAMES = [
  "auto",
  "square",
  "portrait",
  "landscape",
  "wide",
  "cinematic",
  "viewport",
] as const satisfies readonly ComponentDesignRuntimeMediaFrame[];

function normalizeOptionalResponsiveValue<Value>(
  value: unknown,
  normalizeValue: (candidate: unknown) => Value | null,
): ComponentResponsiveValue<Value> | undefined {
  if (!isPlainRecord(value)) return undefined;
  const desktop = normalizeValue(value.desktop);
  const tablet = normalizeValue(value.tablet);
  const mobile = normalizeValue(value.mobile);
  if (desktop === null || tablet === null || mobile === null) return undefined;
  return { desktop, mobile, tablet };
}

function normalizeRuntimePositioning(
  value: unknown,
): ComponentDesignRuntimeNodePositioning | null {
  if (!isPlainRecord(value)) return null;
  if (
    value.mode === "flow" &&
    isFiniteInteger(value.order) &&
    value.order >= 0 &&
    value.order <= 999 &&
    typeof value.gapBefore === "number" &&
    COMPONENT_DESIGN_RHYTHM_TOKENS.includes(
      value.gapBefore as ComponentDesignRhythmToken,
    )
  ) {
    return {
      gapBefore: value.gapBefore as ComponentDesignRhythmToken,
      mode: "flow",
      order: value.order,
    };
  }
  if (
    value.mode === "overlay" &&
    (
      value.anchor === "top" ||
      value.anchor === "center" ||
      value.anchor === "bottom"
    ) &&
    isFiniteInteger(value.offset) &&
    value.offset >= -320 &&
    value.offset <= 320 &&
    value.offset % 8 === 0 &&
    (value.anchored === undefined || value.anchored === true)
  ) {
    return {
      anchor: value.anchor,
      ...(value.anchored === true ? { anchored: true as const } : {}),
      mode: "overlay",
      offset: value.offset,
    };
  }
  return null;
}

function normalizeRuntimeMediaFrame(
  value: unknown,
): ComponentDesignRuntimeMediaFrame | null {
  return typeof value === "string" &&
      (COMPONENT_DESIGN_RUNTIME_MEDIA_FRAMES as readonly string[]).includes(
        value,
      )
    ? value as ComponentDesignRuntimeMediaFrame
    : null;
}

function normalizeRuntimeSectionSpacing(value: unknown): number | null {
  return isFiniteInteger(value) &&
      value >= 0 &&
      value <= 320 &&
      value % 8 === 0
    ? value
    : null;
}

function normalizeRuntimeSection(
  value: unknown,
): ComponentDesignRuntimeSectionLayout | null {
  if (!isPlainRecord(value)) return null;
  const gap = normalizeRuntimeSectionSpacing(value.gap);
  const paddingBottom = normalizeRuntimeSectionSpacing(value.paddingBottom);
  const paddingTop = normalizeRuntimeSectionSpacing(value.paddingTop);
  if (
    gap === null ||
    paddingBottom === null ||
    paddingTop === null ||
    typeof value.height !== "string" ||
    !(COMPONENT_DESIGN_RUNTIME_SECTION_HEIGHTS as readonly string[]).includes(
      value.height,
    ) ||
    typeof value.profile !== "string" ||
    !(COMPONENT_DESIGN_SECTION_PROFILES as readonly string[]).includes(
      value.profile,
    )
  ) {
    return null;
  }
  return {
    gap,
    height: value.height as ComponentDesignRuntimeSectionHeight,
    paddingBottom,
    paddingTop,
    profile: value.profile as ComponentDesignSectionProfile,
  };
}

function normalizeTypography(
  value: unknown,
  fallback: ComponentNodeTypography,
): ComponentNodeTypography {
  if (!isPlainRecord(value)) return clone(fallback);
  const preset = typeof value.preset === "string" &&
      (TYPOGRAPHY_PRESETS as readonly string[]).includes(value.preset)
    ? value.preset as TypographyPreset
    : fallback.preset;
  const requestedSize = typeof value.size === "string" &&
      (TYPOGRAPHY_SIZES as readonly string[]).includes(value.size)
    ? value.size as TypographySize
    : fallback.size;
  const presetFallbackSize = isTypographyFontLabSizeSupported(
    preset,
    fallback.size,
  )
    ? fallback.size
    : getTypographyFontLabSizes(preset)[0];
  const size = isTypographyFontLabSizeSupported(preset, requestedSize)
    ? requestedSize
    : presetFallbackSize;
  const wrap = typeof value.wrap === "string" &&
      (TYPOGRAPHY_WRAP_POLICIES as readonly string[]).includes(value.wrap)
    ? value.wrap as TypographyWrapPolicy
    : fallback.wrap;
  return { preset, size, wrap };
}

function normalizeNode(
  value: unknown,
  fallback: ComponentLayoutNode,
): ComponentLayoutNode {
  const source = isPlainRecord(value) ? value : {};
  const mediaFrame = normalizeOptionalResponsiveValue(
    source.mediaFrame,
    normalizeRuntimeMediaFrame,
  );
  const positioning = normalizeOptionalResponsiveValue(
    source.positioning,
    normalizeRuntimePositioning,
  );
  const typographyFallback = fallback.typography;
  const responsiveTypography = typographyFallback
    ? normalizeOptionalResponsiveValue(
      source.responsiveTypography,
      (candidate) => {
        if (!isPlainRecord(candidate)) return null;
        const normalized = normalizeTypography(candidate, typographyFallback);
        return areJsonStructuresEqual(candidate, normalized)
          ? normalized
          : null;
      },
    )
    : undefined;
  const bleed = fallback.bleed
    ? source.bleed === "viewport" || source.bleed === "none"
      ? source.bleed
      : fallback.bleed
    : undefined;
  const normalizedPlacement = normalizeResponsiveValue(
    source.placement,
    fallback.placement,
    normalizePlacement,
  );
  const finalPlacement = bleed === "viewport"
    ? responsive(placement(1, 12))
    : normalizedPlacement;
  return {
    ...(fallback.alignment
      ? {
        alignment: normalizeResponsiveValue(
          source.alignment,
          fallback.alignment,
          normalizeAlignment,
        ),
      }
      : {}),
    ...(bleed ? { bleed } : {}),
    ...(mediaFrame ? { mediaFrame } : {}),
    ...(fallback.opticalPull !== undefined
      ? {
        opticalPull: normalizeOpticalPull(
          source.opticalPull,
          fallback.opticalPull,
        ),
      }
      : {}),
    placement: finalPlacement,
    ...(positioning ? { positioning } : {}),
    ...(responsiveTypography ? { responsiveTypography } : {}),
    ...(fallback.typography
      ? {
        typography: normalizeTypography(
          source.typography,
          fallback.typography,
        ),
      }
      : {}),
  };
}

function normalizeVariant(
  value: unknown,
  fallback: ComponentVariantLayout,
): ComponentVariantLayout {
  const source = isPlainRecord(value) ? value : {};
  const sourceNodes = isPlainRecord(source.nodes) ? source.nodes : {};
  const sourceGaps = isPlainRecord(source.gaps) ? source.gaps : {};
  const section = normalizeOptionalResponsiveValue(
    source.section,
    normalizeRuntimeSection,
  );
  const sectionProfile =
    typeof source.sectionProfile === "string" &&
      (COMPONENT_DESIGN_SECTION_PROFILES as readonly string[]).includes(
        source.sectionProfile,
      )
      ? source.sectionProfile as ComponentDesignSectionProfile
      : fallback.sectionProfile;

  return {
    gaps: Object.fromEntries(
      Object.entries(fallback.gaps).map(([key, fallbackValue]) => [
        key,
        normalizeResponsiveValue(
          sourceGaps[key],
          fallbackValue,
          normalizeRhythm,
        ),
      ]),
    ),
    nodes: Object.fromEntries(
      Object.entries(fallback.nodes).map(([nodeId, fallbackNode]) => [
        nodeId,
        normalizeNode(sourceNodes[nodeId], fallbackNode),
      ]),
    ),
    ...(section ? { section } : {}),
    sectionProfile,
  };
}

export function normalizeComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV2 {
  const defaults = createDefaultComponentDesignDocument();
  if (!isPlainRecord(value)) return defaults;
  const components = isPlainRecord(value.components) ? value.components : {};
  return {
    components: Object.fromEntries(
      COMPONENT_DESIGN_AUTHOR_COMPONENTS.map((component) => {
        const fallbackEntry = defaults.components[component];
        const sourceEntry = isPlainRecord(components[component])
          ? components[component]
          : {};
        const sourceVariants = isPlainRecord(sourceEntry.variants)
          ? sourceEntry.variants
          : {};
        return [
          component,
          {
            variants: Object.fromEntries(
              Object.entries(fallbackEntry.variants).map(
                ([variantId, fallbackVariant]) => [
                  variantId,
                  normalizeVariant(sourceVariants[variantId], fallbackVariant),
                ],
              ),
            ),
          },
        ];
      }),
    ) as ComponentDesignDocumentV2["components"],
    version: COMPONENT_DESIGN_SCHEMA_VERSION,
  };
}

export function parseCurrentComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV2 | null {
  if (!isPlainRecord(value) || value.version !== COMPONENT_DESIGN_SCHEMA_VERSION) {
    return null;
  }
  const normalized = normalizeComponentDesignDocument(value);
  return areJsonStructuresEqual(value, normalized) ? normalized : null;
}

export function parseComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV2 | null {
  const current = parseCurrentComponentDesignDocument(value);
  if (current) return current;
  const legacy = parseLegacyComponentDesignDocument(value);
  return legacy ? migrateLegacyComponentDesignDocument(legacy) : null;
}

function hasContent(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

export function resolveComponentDesignVariant(
  component: ComponentDesignAuthorComponent,
  props: Record<string, unknown> = {},
): string {
  let variant: string;
  switch (component) {
    case "HeroSection":
      variant = props.variant === "poster" || props.variant === "full"
        ? props.variant
        : hasContent(props.description) ||
            hasContent(props.primaryCtaLabel) ||
            hasContent(props.secondaryCtaLabel)
          ? "full"
          : "poster";
      break;
    case "EditorialHeader":
      variant = props.variant === "collection" ? "collection" : "index";
      break;
    case "EditorialSplit":
      variant = props.layout === "media-left" || props.layout === "stack"
        ? props.layout
        : "media-right";
      break;
    case "ThreeColumnSection":
      variant = props.variant === "triptych" ? "triptych" : "phase";
      break;
    case "StatementBlock":
      variant = props.minHeight === "small" || props.minHeight === "large"
        ? props.minHeight
        : "medium";
      break;
    case "ImagePanel":
      variant = props.variant === "large" || props.variant === "fullscreen"
        ? props.variant
        : "content";
      break;
    case "ProjectCoverLink":
      if (props.variant === "card") {
        variant = "card";
      } else if (props.variant === "immersive-left" || props.variant === "immersive-right") {
        variant = props.variant;
      } else {
        const right = props.align === "right" ||
          (props.align !== "left" &&
            typeof props.index === "number" &&
            props.index % 2 !== 0);
        variant = right ? "immersive-right" : "immersive-left";
      }
      break;
    case "BreakdownHeadline":
      variant = props.variant === "chapter" ? "chapter" : "section";
      break;
    default:
      variant = COMPONENT_DESIGN_MANIFEST_BY_COMPONENT[component].defaultVariant;
      break;
  }
  const descriptor = getComponentDesignVariantDescriptor(component, variant);
  return descriptor.id;
}

export function getComponentVariantLayout(
  document: ComponentDesignDocumentV2,
  component: ComponentDesignAuthorComponent,
  props: Record<string, unknown> = {},
): ComponentVariantLayout {
  const variant = resolveComponentDesignVariant(component, props);
  return document.components[component].variants[variant] ??
    document.components[component].variants[
      COMPONENT_DESIGN_MANIFEST_BY_COMPONENT[component].defaultVariant
    ];
}

export function cloneComponentDesignDocument(
  document: ComponentDesignDocumentV2,
): ComponentDesignDocumentV2 {
  return clone(document);
}
