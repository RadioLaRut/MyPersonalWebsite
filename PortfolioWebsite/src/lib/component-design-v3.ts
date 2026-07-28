import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  getComponentDesignNodePolicyFromVariant,
  getComponentDesignVariantDescriptor,
  type ComponentDesignAuthorComponent,
  type ComponentDesignNodeDescriptor,
  type ComponentDesignVariantDescriptor,
} from "./component-design-manifest.ts";
import {
  COMPONENT_DESIGN_OPTICAL_PULL_TOKENS,
  COMPONENT_DESIGN_RHYTHM_TOKENS,
  COMPONENT_DESIGN_SECTION_PROFILE_VALUES,
  COMPONENT_DESIGN_SECTION_PROFILES,
  cloneComponentDesignDocument as cloneComponentDesignDocumentV2,
  createDefaultComponentDesignDocument as createDefaultComponentDesignDocumentV2,
  normalizeComponentDesignDocument as normalizeComponentDesignDocumentV2,
  parseComponentDesignDocument as parseComponentDesignDocumentV2,
  type ComponentDesignBreakpoint,
  type ComponentDesignDocumentV2,
  type ComponentDesignOpticalPullToken,
  type ComponentDesignRhythmToken,
  type ComponentDesignSectionProfile,
  type ComponentGridPlacement,
  type ComponentNodeTypography,
  type ComponentVariantLayout,
} from "./component-design-v2.ts";
import {
  areJsonStructuresEqual,
  isPlainRecord,
} from "./json-utils.ts";
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

export const COMPONENT_DESIGN_SCHEMA_VERSION = 3 as const;

export const COMPONENT_DESIGN_DEVICES = [
  "desktop",
  "tablet",
  "mobile",
] as const;

export const COMPONENT_DESIGN_DEVICE_OVERRIDE_MODES = [
  "linked",
  "custom",
] as const;

export const COMPONENT_DESIGN_SECTION_HEIGHTS = [
  "auto",
  "compact",
  "normal",
  "tall",
  "viewport",
] as const;

export const COMPONENT_DESIGN_OVERLAY_ANCHORS = [
  "top",
  "center",
  "bottom",
] as const;

export const COMPONENT_DESIGN_MEDIA_FRAMES = [
  "auto",
  "square",
  "portrait",
  "landscape",
  "wide",
  "cinematic",
  "viewport",
] as const;

export type ComponentDesignDevice =
  (typeof COMPONENT_DESIGN_DEVICES)[number];

export type ComponentDesignDeviceOverrideMode =
  (typeof COMPONENT_DESIGN_DEVICE_OVERRIDE_MODES)[number];

export type ComponentDesignSectionHeight =
  (typeof COMPONENT_DESIGN_SECTION_HEIGHTS)[number];

export type ComponentDesignOverlayAnchor =
  (typeof COMPONENT_DESIGN_OVERLAY_ANCHORS)[number];

export type ComponentDesignMediaFrame =
  (typeof COMPONENT_DESIGN_MEDIA_FRAMES)[number];

export type ComponentDesignSampleText = Record<
  string,
  string | string[]
>;

export type ComponentDesignFlowPositioning = {
  gapBefore: ComponentDesignRhythmToken;
  mode: "flow";
  order: number;
};

export type ComponentDesignOverlayPositioning = {
  anchor: ComponentDesignOverlayAnchor;
  anchored?: true;
  mode: "overlay";
  offset: number;
};

export type ComponentDesignNodePositioning =
  | ComponentDesignFlowPositioning
  | ComponentDesignOverlayPositioning;

export type ComponentDesignDeviceNodeLayoutV3 = {
  alignment?: TypographyAlignment;
  bleed?: "none" | "viewport";
  mediaFrame?: ComponentDesignMediaFrame;
  opticalPull?: ComponentDesignOpticalPullToken;
  placement: ComponentGridPlacement;
  positioning: ComponentDesignNodePositioning;
  typography?: ComponentNodeTypography;
};

export type ComponentDesignSectionLayoutV3 = {
  gap: number;
  height: ComponentDesignSectionHeight;
  paddingBottom: number;
  paddingTop: number;
  profile: ComponentDesignSectionProfile;
};

export type ComponentDesignDeviceLayoutV3 = {
  gaps: Record<string, ComponentDesignRhythmToken>;
  nodes: Record<string, ComponentDesignDeviceNodeLayoutV3>;
  section: ComponentDesignSectionLayoutV3;
};

export type ComponentDesignDeviceOverrideV3 = {
  custom: ComponentDesignDeviceLayoutV3;
  customInitialized: boolean;
  mode: ComponentDesignDeviceOverrideMode;
};

export type ComponentDesignVariantV3 = {
  desktop: ComponentDesignDeviceLayoutV3;
  mobile: ComponentDesignDeviceOverrideV3;
  sampleText: ComponentDesignSampleText;
  tablet: ComponentDesignDeviceOverrideV3;
};

export type ComponentDesignEntryV3 = {
  variants: Record<string, ComponentDesignVariantV3>;
};

export type ComponentDesignDocumentV3 = {
  components: Record<ComponentDesignAuthorComponent, ComponentDesignEntryV3>;
  version: typeof COMPONENT_DESIGN_SCHEMA_VERSION;
};

export type ComponentDesignDocument = ComponentDesignDocumentV3;

export type ComponentDesignDeepPartial<Value> =
  Value extends string | number | boolean | null
    ? Value
    : Value extends readonly unknown[]
      ? Value
      : {
        [Key in keyof Value]?: ComponentDesignDeepPartial<Value[Key]>;
      };

export type ComponentDesignVariantPatchV3 =
  ComponentDesignDeepPartial<ComponentDesignVariantV3>;

const MAX_SECTION_SPACING = 320;
const MAX_OVERLAY_OFFSET = 320;
const MAX_FLOW_ORDER = 999;
const UNSAFE_PATCH_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function clone<Value>(value: Value): Value {
  return structuredClone(value);
}

function isFiniteInteger(value: unknown): value is number {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value);
}

function isGridPlacement(value: unknown): value is ComponentGridPlacement {
  if (!isPlainRecord(value)) return false;
  const keys = Object.keys(value).sort();
  return keys.length === 2 &&
    keys[0] === "span" &&
    keys[1] === "start" &&
    isFiniteInteger(value.start) &&
    isFiniteInteger(value.span) &&
    value.start >= 1 &&
    value.start <= 12 &&
    value.span >= 1 &&
    value.start + value.span <= 13;
}

function isRhythmToken(value: unknown): value is ComponentDesignRhythmToken {
  return typeof value === "number" &&
    COMPONENT_DESIGN_RHYTHM_TOKENS.includes(
      value as ComponentDesignRhythmToken,
    );
}

function isOpticalPullToken(
  value: unknown,
): value is ComponentDesignOpticalPullToken {
  return typeof value === "number" &&
    COMPONENT_DESIGN_OPTICAL_PULL_TOKENS.includes(
      value as ComponentDesignOpticalPullToken,
    );
}

function isSectionSpacing(value: unknown): value is number {
  return isFiniteInteger(value) &&
    value >= 0 &&
    value <= MAX_SECTION_SPACING &&
    value % 8 === 0;
}

function isOverlayOffset(value: unknown): value is number {
  return isFiniteInteger(value) &&
    value >= -MAX_OVERLAY_OFFSET &&
    value <= MAX_OVERLAY_OFFSET &&
    value % 8 === 0;
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
  const fallbackSize = isTypographyFontLabSizeSupported(
      preset,
      fallback.size,
    )
    ? fallback.size
    : getTypographyFontLabSizes(preset)[0];
  const size = isTypographyFontLabSizeSupported(preset, requestedSize)
    ? requestedSize
    : fallbackSize;
  const wrap = typeof value.wrap === "string" &&
      (TYPOGRAPHY_WRAP_POLICIES as readonly string[]).includes(value.wrap)
    ? value.wrap as TypographyWrapPolicy
    : fallback.wrap;
  return { preset, size, wrap };
}

function normalizePositioning(
  value: unknown,
  fallback: ComponentDesignNodePositioning,
  capability: ComponentDesignNodeDescriptor["positioning"],
): ComponentDesignNodePositioning {
  const expectedMode = capability === "flow" ? "flow" : "overlay";
  const constrainedFallback: ComponentDesignNodePositioning =
    expectedMode === "flow"
      ? fallback.mode === "flow"
        ? clone(fallback)
        : {
          gapBefore: 0,
          mode: "flow",
          order: 0,
        }
      : fallback.mode === "overlay"
        ? clone(fallback)
        : {
          anchor: "center",
          mode: "overlay",
          offset: 0,
        };

  if (
    capability === "fixed" ||
    !isPlainRecord(value) ||
    value.mode !== expectedMode
  ) {
    return constrainedFallback;
  }
  if (expectedMode === "flow") {
    return {
      gapBefore: isRhythmToken(value.gapBefore)
        ? value.gapBefore
        : constrainedFallback.mode === "flow"
          ? constrainedFallback.gapBefore
          : 0,
      mode: "flow",
      order: isFiniteInteger(value.order) &&
          value.order >= 0 &&
          value.order <= MAX_FLOW_ORDER
        ? value.order
        : constrainedFallback.mode === "flow"
          ? constrainedFallback.order
          : 0,
    };
  }
  return {
    anchor: typeof value.anchor === "string" &&
        (COMPONENT_DESIGN_OVERLAY_ANCHORS as readonly string[]).includes(
          value.anchor,
        )
      ? value.anchor as ComponentDesignOverlayAnchor
      : constrainedFallback.mode === "overlay"
        ? constrainedFallback.anchor
        : "center",
    ...(value.anchored === true ? { anchored: true as const } : {}),
    mode: "overlay",
    offset: isOverlayOffset(value.offset)
      ? value.offset
      : constrainedFallback.mode === "overlay"
        ? constrainedFallback.offset
        : 0,
  };
}

function normalizeNode(
  value: unknown,
  fallback: ComponentDesignDeviceNodeLayoutV3,
  descriptor: ComponentDesignNodeDescriptor,
): ComponentDesignDeviceNodeLayoutV3 {
  const source = isPlainRecord(value) ? value : {};
  return {
    ...(descriptor.alignment && fallback.alignment
      ? {
        alignment: isTypographyAlignment(source.alignment)
          ? source.alignment
          : fallback.alignment,
      }
      : {}),
    ...(descriptor.bleed
      ? { bleed: descriptor.bleed }
      : {}),
    ...(descriptor.kind === "media" && fallback.mediaFrame
      ? {
        mediaFrame: typeof source.mediaFrame === "string" &&
            (
              descriptor.mediaFrames ??
                COMPONENT_DESIGN_MEDIA_FRAMES
            ).includes(
              source.mediaFrame as ComponentDesignMediaFrame,
            )
          ? source.mediaFrame as ComponentDesignMediaFrame
          : fallback.mediaFrame,
      }
      : {}),
    ...(descriptor.opticalPull && fallback.opticalPull !== undefined
      ? {
        opticalPull: isOpticalPullToken(source.opticalPull)
          ? source.opticalPull
          : fallback.opticalPull,
      }
      : {}),
    placement: descriptor.bleed === "viewport"
      ? { span: 12, start: 1 }
      : isGridPlacement(source.placement)
        ? clone(source.placement)
        : clone(fallback.placement),
    positioning: normalizePositioning(
      source.positioning,
      fallback.positioning,
      descriptor.positioning,
    ),
    ...(descriptor.typography && fallback.typography
      ? {
        typography: normalizeTypography(
          source.typography,
          fallback.typography,
        ),
      }
      : {}),
  };
}

function normalizeSection(
  value: unknown,
  fallback: ComponentDesignSectionLayoutV3,
): ComponentDesignSectionLayoutV3 {
  const source = isPlainRecord(value) ? value : {};
  return {
    gap: isSectionSpacing(source.gap) ? source.gap : fallback.gap,
    height: typeof source.height === "string" &&
        (COMPONENT_DESIGN_SECTION_HEIGHTS as readonly string[]).includes(
          source.height,
        )
      ? source.height as ComponentDesignSectionHeight
      : fallback.height,
    paddingBottom: isSectionSpacing(source.paddingBottom)
      ? source.paddingBottom
      : fallback.paddingBottom,
    paddingTop: isSectionSpacing(source.paddingTop)
      ? source.paddingTop
      : fallback.paddingTop,
    profile: typeof source.profile === "string" &&
        (COMPONENT_DESIGN_SECTION_PROFILES as readonly string[]).includes(
          source.profile,
        )
      ? source.profile as ComponentDesignSectionProfile
      : fallback.profile,
  };
}

function normalizeDeviceLayout(
  value: unknown,
  fallback: ComponentDesignDeviceLayoutV3,
  descriptor: ComponentDesignVariantDescriptor,
): ComponentDesignDeviceLayoutV3 {
  const source = isPlainRecord(value) ? value : {};
  const sourceGaps = isPlainRecord(source.gaps) ? source.gaps : {};
  const sourceNodes = isPlainRecord(source.nodes) ? source.nodes : {};
  const nodes = Object.fromEntries(
    Object.entries(fallback.nodes).map(([nodeId, fallbackNode]) => {
      const nodeDescriptor = descriptor.nodes.find(
        (candidate) => candidate.id === nodeId,
      )!;
      const policy = getComponentDesignNodePolicyFromVariant(
        descriptor,
        nodeId,
      );
      const normalized = normalizeNode(
        sourceNodes[nodeId],
        fallbackNode,
        nodeDescriptor,
      );
      return [
        nodeId,
        {
          ...normalized,
          ...(policy.lockPlacement
            ? { placement: clone(fallbackNode.placement) }
            : {}),
          ...(policy.lockPositioning
            ? { positioning: clone(fallbackNode.positioning) }
            : {}),
        },
      ];
    }),
  ) as ComponentDesignDeviceLayoutV3["nodes"];

  for (const nodeDescriptor of descriptor.nodes) {
    const policy = getComponentDesignNodePolicyFromVariant(
      descriptor,
      nodeDescriptor.id,
    );
    if (!policy.constrainToHost) continue;
    const node = nodes[nodeDescriptor.id];
    const host = nodes[policy.constrainToHost];
    if (!node || !host) continue;
    const hostEnd = host.placement.start + host.placement.span - 1;
    const start = Math.min(
      hostEnd,
      Math.max(host.placement.start, node.placement.start),
    );
    node.placement = {
      span: Math.min(node.placement.span, hostEnd - start + 1),
      start,
    };
  }

  return {
    gaps: Object.fromEntries(
      Object.entries(fallback.gaps).map(([key, fallbackValue]) => [
        key,
        isRhythmToken(sourceGaps[key]) ? sourceGaps[key] : fallbackValue,
      ]),
    ),
    nodes,
    section: normalizeSection(source.section, fallback.section),
  };
}

function normalizeSampleText(
  value: unknown,
  descriptors: readonly ComponentDesignNodeDescriptor[],
): ComponentDesignSampleText {
  if (!isPlainRecord(value)) return {};
  return Object.fromEntries(
    descriptors
      .filter((descriptor) => {
        const binding = descriptor.sampleBinding;
        const entry = value[descriptor.id];
        if (!binding || UNSAFE_PATCH_KEYS.has(descriptor.id)) return false;
        return binding.kind === "repeated"
          ? Array.isArray(entry) &&
            entry.every((item) => typeof item === "string")
          : typeof entry === "string";
      })
      .map((descriptor) => [
        descriptor.id,
        clone(value[descriptor.id] as string | string[]),
      ]),
  );
}

function normalizeDeviceOverride(
  value: unknown,
  fallback: ComponentDesignDeviceOverrideV3,
  descriptor: ComponentDesignVariantDescriptor,
): ComponentDesignDeviceOverrideV3 {
  const source = isPlainRecord(value) ? value : {};
  return {
    custom: normalizeDeviceLayout(
      source.custom,
      fallback.custom,
      descriptor,
    ),
    customInitialized: typeof source.customInitialized === "boolean"
      ? source.customInitialized
      : source.mode === "custom"
        ? true
        : fallback.customInitialized,
    mode: source.mode === "linked" || source.mode === "custom"
      ? source.mode
      : fallback.mode,
  };
}

function normalizeVariant(
  value: unknown,
  fallback: ComponentDesignVariantV3,
  descriptor: ComponentDesignVariantDescriptor,
): ComponentDesignVariantV3 {
  const source = isPlainRecord(value) ? value : {};
  return {
    desktop: normalizeDeviceLayout(
      source.desktop,
      fallback.desktop,
      descriptor,
    ),
    mobile: normalizeDeviceOverride(
      source.mobile,
      fallback.mobile,
      descriptor,
    ),
    sampleText: normalizeSampleText(source.sampleText, descriptor.nodes),
    tablet: normalizeDeviceOverride(
      source.tablet,
      fallback.tablet,
      descriptor,
    ),
  };
}

function getGapBefore(
  layout: ComponentVariantLayout,
  descriptors: readonly ComponentDesignNodeDescriptor[],
  nodeIndex: number,
  breakpoint: ComponentDesignBreakpoint,
): ComponentDesignRhythmToken {
  if (nodeIndex <= 0) return 0;
  const nodeId = descriptors[nodeIndex].id;
  const previousId = descriptors[nodeIndex - 1].id;
  return layout.gaps[`${previousId}>${nodeId}`]?.[breakpoint] ?? 0;
}

function migrateNode(
  node: ComponentVariantLayout["nodes"][string],
  descriptor: ComponentDesignNodeDescriptor,
  breakpoint: ComponentDesignBreakpoint,
  order: number,
  gapBefore: ComponentDesignRhythmToken,
): ComponentDesignDeviceNodeLayoutV3 {
  const isViewportMedia = descriptor.kind === "media" &&
    descriptor.bleed === "viewport";
  const storedPositioning = node.positioning?.[breakpoint];
  const fallbackPositioning: ComponentDesignNodePositioning =
    descriptor.positioning === "flow"
      ? {
        gapBefore,
        mode: "flow",
        order,
      }
      : {
        anchor: "center",
        mode: "overlay",
        offset: 0,
      };
  return {
    ...(descriptor.alignment
      ? { alignment: node.alignment?.[breakpoint] ?? "left" }
      : {}),
    ...(descriptor.bleed ? { bleed: descriptor.bleed } : {}),
    ...(descriptor.kind === "media"
      ? {
        mediaFrame: (
          descriptor.mediaFrames?.includes(
            node.mediaFrame?.[breakpoint] as ComponentDesignMediaFrame,
          )
            ? node.mediaFrame?.[breakpoint]
            : descriptor.mediaFrames?.[0]
        ) ?? (isViewportMedia ? "viewport" as const : "auto" as const),
      }
      : {}),
    ...(descriptor.opticalPull
      ? { opticalPull: node.opticalPull ?? 0 }
      : {}),
    placement: isViewportMedia
      ? { span: 12, start: 1 }
      : clone(node.placement[breakpoint]),
    positioning: normalizePositioning(
      storedPositioning,
      fallbackPositioning,
      descriptor.positioning,
    ),
    ...(descriptor.typography
      ? { typography: clone(node.typography ?? descriptor.typography) }
      : {}),
  };
}

function migrateDeviceLayout(
  layout: ComponentVariantLayout,
  component: ComponentDesignAuthorComponent,
  variant: string,
  breakpoint: ComponentDesignBreakpoint,
): ComponentDesignDeviceLayoutV3 {
  const descriptor = getComponentDesignVariantDescriptor(component, variant);
  const storedSection = layout.section?.[breakpoint];
  const spacing = COMPONENT_DESIGN_SECTION_PROFILE_VALUES[
    layout.sectionProfile
  ][breakpoint];
  return {
    gaps: Object.fromEntries(
      Object.entries(layout.gaps).map(([key, value]) => [
        key,
        value[breakpoint],
      ]),
    ),
    nodes: Object.fromEntries(
      descriptor.nodes.map((node, index) => [
        node.id,
        migrateNode(
          layout.nodes[node.id],
          node,
          breakpoint,
          index,
          getGapBefore(layout, descriptor.nodes, index, breakpoint),
        ),
      ]),
    ),
    section: storedSection
      ? clone(storedSection)
      : {
        gap: 0,
        height: "auto",
        paddingBottom: spacing.bottom,
        paddingTop: spacing.top,
        profile: layout.sectionProfile,
      },
  };
}

export function migrateComponentDesignDocumentV2ToV3(
  document: ComponentDesignDocumentV2,
): ComponentDesignDocumentV3 {
  const source = normalizeComponentDesignDocumentV2(document);
  const migrated = {
    components: Object.fromEntries(
      COMPONENT_DESIGN_AUTHOR_COMPONENTS.map((component) => [
        component,
        {
          variants: Object.fromEntries(
            Object.entries(source.components[component].variants).map(
              ([variant, layout]) => [
                variant,
                {
                  desktop: migrateDeviceLayout(
                    layout,
                    component,
                    variant,
                    "desktop",
                  ),
                  mobile: {
                    custom: migrateDeviceLayout(
                      layout,
                      component,
                      variant,
                      "mobile",
                    ),
                    customInitialized: true,
                    mode: "custom",
                  },
                  sampleText: {},
                  tablet: {
                    custom: migrateDeviceLayout(
                      layout,
                      component,
                      variant,
                      "tablet",
                    ),
                    customInitialized: true,
                    mode: "custom",
                  },
                },
              ],
            ),
          ),
        },
      ]),
    ) as ComponentDesignDocumentV3["components"],
    version: COMPONENT_DESIGN_SCHEMA_VERSION,
  };
  const projectCard = migrated.components.ProjectCoverLink.variants.card;
  for (const cardLayout of [
    projectCard.desktop,
    projectCard.tablet.custom,
    projectCard.mobile.custom,
  ]) {
    cardLayout.nodes.number.positioning = {
      anchor: "top",
      anchored: true,
      mode: "overlay",
      offset: 0,
    };
    cardLayout.nodes.prompt.positioning = {
      anchor: "top",
      anchored: true,
      mode: "overlay",
      offset: 0,
    };
    cardLayout.nodes.title.positioning = {
      anchor: "bottom",
      anchored: true,
      mode: "overlay",
      offset: 0,
    };
  }
  return migrated;
}

export function createDefaultComponentDesignDocument():
  ComponentDesignDocumentV3 {
  const document = migrateComponentDesignDocumentV2ToV3(
    createDefaultComponentDesignDocumentV2(),
  );
  const projectCard =
    document.components.ProjectCoverLink.variants.card;
  projectCard.desktop.section = {
    ...projectCard.desktop.section,
    paddingBottom: 32,
    paddingTop: 32,
    profile: "compact",
  };
  projectCard.tablet.custom.section = {
    ...projectCard.tablet.custom.section,
    paddingBottom: 24,
    paddingTop: 24,
    profile: "compact",
  };
  projectCard.mobile.custom.section = {
    ...projectCard.mobile.custom.section,
    paddingBottom: 16,
    paddingTop: 16,
    profile: "compact",
  };
  for (const cardLayout of [
    projectCard.desktop,
    projectCard.tablet.custom,
    projectCard.mobile.custom,
  ]) {
    cardLayout.nodes.number.positioning = {
      anchor: "top",
      anchored: true,
      mode: "overlay",
      offset: 0,
    };
    cardLayout.nodes.prompt.positioning = {
      anchor: "top",
      anchored: true,
      mode: "overlay",
      offset: 0,
    };
    cardLayout.nodes.title.positioning = {
      anchor: "bottom",
      anchored: true,
      mode: "overlay",
      offset: 0,
    };
  }
  for (const component of COMPONENT_DESIGN_AUTHOR_COMPONENTS) {
    for (
      const variant of Object.values(
        document.components[component].variants,
      )
    ) {
      variant.tablet.mode = "linked";
      variant.mobile.mode = "linked";
      variant.tablet.customInitialized = false;
      variant.mobile.customInitialized = false;
    }
  }
  return document;
}

export const createDefaultComponentDesignDocumentV3 =
  createDefaultComponentDesignDocument;

export function normalizeComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV3 {
  const defaults = createDefaultComponentDesignDocument();
  if (!isPlainRecord(value)) return defaults;
  const components = isPlainRecord(value.components) ? value.components : {};
  return {
    components: Object.fromEntries(
      COMPONENT_DESIGN_AUTHOR_COMPONENTS.map((component) => {
        const sourceEntry = isPlainRecord(components[component])
          ? components[component]
          : {};
        const sourceVariants = isPlainRecord(sourceEntry.variants)
          ? sourceEntry.variants
          : {};
        const fallbackEntry = defaults.components[component];
        return [
          component,
          {
            variants: Object.fromEntries(
              Object.entries(fallbackEntry.variants).map(
                ([variant, fallbackVariant]) => [
                  variant,
                  normalizeVariant(
                    sourceVariants[variant],
                    fallbackVariant,
                    getComponentDesignVariantDescriptor(
                      component,
                      variant,
                    ),
                  ),
                ],
              ),
            ),
          },
        ];
      }),
    ) as ComponentDesignDocumentV3["components"],
    version: COMPONENT_DESIGN_SCHEMA_VERSION,
  };
}

export const normalizeComponentDesignDocumentV3 =
  normalizeComponentDesignDocument;

export function parseCurrentComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV3 | null {
  if (!isPlainRecord(value) || value.version !== COMPONENT_DESIGN_SCHEMA_VERSION) {
    return null;
  }
  const normalized = normalizeComponentDesignDocument(value);
  return areJsonStructuresEqual(value, normalized) ? normalized : null;
}

export const parseCurrentComponentDesignDocumentV3 =
  parseCurrentComponentDesignDocument;

export function parseComponentDesignDocument(
  value: unknown,
): ComponentDesignDocumentV3 | null {
  const current = parseCurrentComponentDesignDocument(value);
  if (current) return current;
  const previous = parseComponentDesignDocumentV2(value);
  if (previous) return migrateComponentDesignDocumentV2ToV3(previous);
  if (
    isPlainRecord(value) &&
    value.version === 2 &&
    isPlainRecord(value.components)
  ) {
    return migrateComponentDesignDocumentV2ToV3(
      normalizeComponentDesignDocumentV2(value),
    );
  }
  return null;
}

export const parseComponentDesignDocumentV3 =
  parseComponentDesignDocument;

export function cloneComponentDesignDocument(
  document: ComponentDesignDocumentV3,
): ComponentDesignDocumentV3 {
  return clone(document);
}

export const cloneComponentDesignDocumentV3 =
  cloneComponentDesignDocument;

export function resolveComponentDesignDeviceLayout(
  variant: ComponentDesignVariantV3,
  device: ComponentDesignDevice,
): ComponentDesignDeviceLayoutV3 {
  if (device === "desktop") return clone(variant.desktop);
  const override = variant[device];
  return clone(
    override.mode === "linked" ? variant.desktop : override.custom,
  );
}

export function enableComponentDesignDeviceOverride(
  variant: ComponentDesignVariantV3,
  device: Exclude<ComponentDesignDevice, "desktop">,
): ComponentDesignVariantV3 {
  const next = clone(variant);
  const override = next[device];
  if (!override.customInitialized) {
    override.custom = clone(next.desktop);
    override.customInitialized = true;
  }
  override.mode = "custom";
  return next;
}

function resolveDeviceGaps(
  layout: ComponentDesignDeviceLayoutV3,
): Record<string, ComponentDesignRhythmToken> {
  const gaps = clone(layout.gaps);
  const flowNodes = Object.entries(layout.nodes)
    .filter((entry): entry is [
      string,
      ComponentDesignDeviceNodeLayoutV3 & {
        positioning: ComponentDesignFlowPositioning;
      },
    ] => entry[1].positioning.mode === "flow")
    .sort((left, right) => (
      left[1].positioning.order - right[1].positioning.order
    ));
  for (let index = 1; index < flowNodes.length; index += 1) {
    const [previousId] = flowNodes[index - 1];
    const [nodeId, node] = flowNodes[index];
    const gapKey = `${previousId}>${nodeId}`;
    if (gapKey in gaps) {
      gaps[gapKey] = node.positioning.gapBefore;
    }
  }
  return gaps;
}

export function resolveComponentDesignRuntimeDocument(
  document: ComponentDesignDocumentV3,
): ComponentDesignDocumentV2 {
  const normalized = normalizeComponentDesignDocument(document);
  const runtime = cloneComponentDesignDocumentV2(
    createDefaultComponentDesignDocumentV2(),
  );

  for (const component of COMPONENT_DESIGN_AUTHOR_COMPONENTS) {
    for (
      const [variantId, variant] of Object.entries(
        normalized.components[component].variants,
      )
    ) {
      const desktop = resolveComponentDesignDeviceLayout(
        variant,
        "desktop",
      );
      const tablet = resolveComponentDesignDeviceLayout(variant, "tablet");
      const mobile = resolveComponentDesignDeviceLayout(variant, "mobile");
      const desktopGaps = resolveDeviceGaps(desktop);
      const tabletGaps = resolveDeviceGaps(tablet);
      const mobileGaps = resolveDeviceGaps(mobile);
      const runtimeVariant = runtime.components[component].variants[variantId];

      runtimeVariant.sectionProfile = desktop.section.profile;
      runtimeVariant.section = {
        desktop: clone(desktop.section),
        mobile: clone(mobile.section),
        tablet: clone(tablet.section),
      };
      for (const gapKey of Object.keys(runtimeVariant.gaps)) {
        runtimeVariant.gaps[gapKey] = {
          desktop: desktopGaps[gapKey],
          mobile: mobileGaps[gapKey],
          tablet: tabletGaps[gapKey],
        };
      }
      for (const nodeId of Object.keys(runtimeVariant.nodes)) {
        const runtimeNode = runtimeVariant.nodes[nodeId];
        const desktopNode = desktop.nodes[nodeId];
        const tabletNode = tablet.nodes[nodeId];
        const mobileNode = mobile.nodes[nodeId];
        runtimeNode.placement = {
          desktop: clone(desktopNode.placement),
          mobile: clone(mobileNode.placement),
          tablet: clone(tabletNode.placement),
        };
        if (runtimeNode.alignment) {
          runtimeNode.alignment = {
            desktop: desktopNode.alignment!,
            mobile: mobileNode.alignment!,
            tablet: tabletNode.alignment!,
          };
        }
        if (runtimeNode.bleed) runtimeNode.bleed = desktopNode.bleed!;
        runtimeNode.positioning = {
          desktop: clone(desktopNode.positioning),
          mobile: clone(mobileNode.positioning),
          tablet: clone(tabletNode.positioning),
        };
        if (
          desktopNode.mediaFrame &&
          tabletNode.mediaFrame &&
          mobileNode.mediaFrame
        ) {
          runtimeNode.mediaFrame = {
            desktop: desktopNode.mediaFrame,
            mobile: mobileNode.mediaFrame,
            tablet: tabletNode.mediaFrame,
          };
        }
        if (runtimeNode.opticalPull !== undefined) {
          runtimeNode.opticalPull = desktopNode.opticalPull!;
        }
        if (runtimeNode.typography) {
          runtimeNode.typography = clone(desktopNode.typography!);
          runtimeNode.responsiveTypography = {
            desktop: clone(desktopNode.typography!),
            mobile: clone(mobileNode.typography!),
            tablet: clone(tabletNode.typography!),
          };
        }
      }
    }
  }

  return normalizeComponentDesignDocumentV2(runtime);
}

function isSafePatchValue(value: unknown, depth = 0): boolean {
  if (depth > 32) return false;
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) {
    return value.every((entry) => isSafePatchValue(entry, depth + 1));
  }
  if (!isPlainRecord(value)) return false;
  return Object.entries(value).every(([key, entry]) => (
    !UNSAFE_PATCH_KEYS.has(key) &&
    isSafePatchValue(entry, depth + 1)
  ));
}

function mergePatchValue(base: unknown, patch: unknown): unknown {
  if (!isPlainRecord(base) || !isPlainRecord(patch)) return clone(patch);
  const result: Record<string, unknown> = clone(base);
  for (const [key, value] of Object.entries(patch)) {
    result[key] = key in result
      ? mergePatchValue(result[key], value)
      : clone(value);
  }
  return result;
}

export function isComponentDesignAuthorComponent(
  value: unknown,
): value is ComponentDesignAuthorComponent {
  return typeof value === "string" &&
    (COMPONENT_DESIGN_AUTHOR_COMPONENTS as readonly string[]).includes(value);
}

export function mergeComponentDesignVariantPatch(
  document: ComponentDesignDocumentV3,
  component: ComponentDesignAuthorComponent,
  variant: string,
  patch: unknown,
): ComponentDesignDocumentV3 | null {
  if (!isPlainRecord(patch) || !isSafePatchValue(patch)) return null;
  const currentVariant = document.components[component]?.variants[variant];
  if (!currentVariant) return null;
  const next = clone(document);
  next.components[component].variants[variant] = mergePatchValue(
    currentVariant,
    patch,
  ) as ComponentDesignVariantV3;
  return parseCurrentComponentDesignDocument(next);
}
