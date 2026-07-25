import type { Data } from "@puckeditor/core";

import { assertPageDocumentBudget } from "./content-budget.ts";
import { isPlainRecord } from "./json-utils.ts";
import {
  collectImageLikeReferences,
  hasExactCasePath,
  type ContentValidationIssue,
} from "./puck-content-validation.ts";
import { normalizePuckData } from "./puck-data-normalization.ts";
import { toSafePuckHref } from "./puck-href.ts";
import { isSupportedPublicMediaPath } from "./media-library-paths.ts";
import { parseBilibiliVideoSource } from "./bilibili-embed.ts";
import {
  PUCK_COMPONENT_TYPE_SET,
  type PuckComponentType,
} from "../puck/component-manifest.ts";

export const PAGE_DOCUMENT_VERSION = 1 as const;

export type PageRootProps = {
  description: string;
  image: string;
  noIndex: boolean;
  title: string;
};

export type PageDocument = Data & {
  root: {
    props: PageRootProps;
  };
  version: typeof PAGE_DOCUMENT_VERSION;
};

type PropKind = "array" | "boolean" | "number" | "string";
type PropContract = Readonly<Record<string, PropKind>>;

const string = "string" as const;
const number = "number" as const;
const boolean = "boolean" as const;
const array = "array" as const;

function withId(contract: PropContract): PropContract {
  return { id: string, editorDisplayName: string, ...contract };
}

const threeColumnContract = Object.fromEntries(
  [1, 2, 3].flatMap((column) => [
    [`col${column}Label`, string],
    [`col${column}Title`, string],
    [`col${column}Subtitle`, string],
    [`col${column}Body`, string],
    [`col${column}BodyAlign`, string],
    [`col${column}MediaSrc`, string],
    [`col${column}MediaPreset`, string],
    [`col${column}MediaFitMode`, string],
    ...(column < 3 ? [[`col${column}Items`, array] as const] : []),
  ]),
) as PropContract;

export const PAGE_COMPONENT_PROP_CONTRACTS = {
  BilibiliEmbed: withId({
    caption: string,
    captionAlign: string,
    source: string,
    title: string,
  }),
  BreakdownHeadline: withId({ indexLabel: string, title: string, variant: string }),
  ContactFlashlight: withId({
    anchorId: string,
    copyErrorMessage: string,
    copyLabel: string,
    copySuccessMessage: string,
    creativeDirection: array,
    darkTextColor: string,
    email: string,
    experienceHistory: array,
    lightTextColor: string,
    maskRadius: number,
    maskSmoothness: number,
    name: string,
    taglineSub: string,
    taglineSubAlign: string,
    taglineText: string,
    wechat: string,
  }),
  EditorialHeader: withId({
    backHref: string,
    ctaHref: string,
    ctaLabel: string,
    description: string,
    descriptionAlign: string,
    descriptionLine1: string,
    descriptionLine2: string,
    number: string,
    subtitle: string,
    title: string,
    variant: string,
  }),
  EditorialSplit: withId({
    body: string,
    bodyAlign: string,
    bodyMode: string,
    heading: string,
    imageFitMode: string,
    imagePreset: string,
    imageSrc: string,
    layout: string,
    paragraphs: array,
  }),
  HeroHeadline: withId({
    eyebrow: string,
    heroImage: string,
    heroImageFitMode: string,
    heroImagePreset: string,
    navLink: string,
    navLinkLabel: string,
    subtitle: string,
    subtitleAlign: string,
    title: string,
  }),
  HeroSection: withId({
    description: string,
    descriptionAlign: string,
    eyebrow: string,
    imageAlt: string,
    imageFitMode: string,
    imagePreset: string,
    imageSrc: string,
    mobileImageFocalX: number,
    mobileImageFocalY: number,
    positioning: string,
    primaryCtaHref: string,
    primaryCtaLabel: string,
    secondaryCtaHref: string,
    secondaryCtaLabel: string,
    subtitle: string,
    title: string,
  }),
  HomeEndcapSection: withId({
    buttonHref: string,
    buttonLabel: string,
    description: string,
    descriptionAlign: string,
    eyebrow: string,
    title: string,
  }),
  ImagePanel: withId({
    alt: string,
    caption: string,
    captionAlign: string,
    fitMode: string,
    preset: string,
    src: string,
    variant: string,
  }),
  ImageSlider: withId({
    alt: string,
    imageFitMode: string,
    imagePreset: string,
    initialPosition: number,
    leftLabel: string,
    litSrc: string,
    rightLabel: string,
    title: string,
    unlitSrc: string,
  }),
  MetadataListItem: withId({ align: string, label: string, value: string }),
  NextProjectBlock: withId({
    nextId: string,
  }),
  ParameterGrid: withId({
    imageFitMode: string,
    imagePreset: string,
    mediaSrc: string,
    parameters: array,
  }),
  ProjectCoverLink: withId({
    align: string,
    href: string,
    imageFitMode: string,
    imagePreset: string,
    index: number,
    mediaSrc: string,
    mobileImageFocalX: number,
    mobileImageFocalY: number,
    number: string,
    subtitle: string,
    title: string,
    variant: string,
  }),
  RichParagraph: withId({ align: string, content: string }),
  StatementBlock: withId({
    align: string,
    backgroundColor: string,
    content: string,
    minHeight: string,
  }),
  TextParagraphBlock: withId({ align: string, text: string }),
  ThreeColumnSection: withId({
    ...threeColumnContract,
    rhythm: string,
    variant: string,
  }),
  WorksList: withId({ entries: array, heading: string, indexSummary: string }),
  WorksListEntry: withId({
    aliases: array,
    category: string,
    desc: string,
    descriptionAlign: string,
    href: string,
    imageFitMode: string,
    imagePreset: string,
    imageSrc: string,
    number: string,
    title: string,
  }),
} satisfies Record<PuckComponentType, PropContract>;

const ROOT_PROP_CONTRACT: PropContract = {
  description: string,
  image: string,
  noIndex: boolean,
  title: string,
};

const LINK_PROP_PATTERN = /(?:href|link|url)$/i;
const SLOT_COMPONENTS: Partial<Record<PuckComponentType, Readonly<Record<string, readonly PuckComponentType[]>>>> = {
  ContactFlashlight: {
    creativeDirection: ["MetadataListItem"],
    experienceHistory: ["MetadataListItem"],
  },
  EditorialSplit: { paragraphs: ["TextParagraphBlock"] },
  ThreeColumnSection: {
    col1Items: ["MetadataListItem"],
    col2Items: ["MetadataListItem"],
  },
  WorksList: { entries: ["WorksListEntry"] },
};

const PROP_ENUMS: Partial<Record<PuckComponentType, Readonly<Record<string, readonly unknown[]>>>> = {
  BreakdownHeadline: { variant: ["chapter", "section"] },
  EditorialHeader: {
    descriptionAlign: ["left", "center", "right", "justify"],
    variant: ["index", "collection"],
  },
  EditorialSplit: {
    bodyAlign: ["left", "center", "right", "justify"],
    bodyMode: ["plain", "slot"],
    layout: ["media-left", "media-right", "stack"],
  },
  HeroHeadline: {
    subtitleAlign: ["left", "center", "right", "justify"],
  },
  HeroSection: {
    descriptionAlign: ["left", "center", "right", "justify"],
  },
  HomeEndcapSection: {
    descriptionAlign: ["left", "center", "right", "justify"],
  },
  ImagePanel: {
    captionAlign: ["left", "center", "right", "justify"],
    variant: ["content", "large", "fullscreen"],
  },
  MetadataListItem: { align: ["start", "end"] },
  ProjectCoverLink: {
    align: ["auto", "left", "right"],
    variant: ["immersive", "card"],
  },
  RichParagraph: {
    align: ["left", "center", "right", "justify"],
  },
  StatementBlock: {
    align: ["left", "center", "right"],
    backgroundColor: ["black", "dark-gray"],
    minHeight: ["small", "medium", "large"],
  },
  TextParagraphBlock: {
    align: ["left", "center", "right", "justify"],
  },
  ThreeColumnSection: {
    col1BodyAlign: ["left", "center", "right", "justify"],
    col2BodyAlign: ["left", "center", "right", "justify"],
    col3BodyAlign: ["left", "center", "right", "justify"],
    rhythm: ["aligned", "staggered"],
    variant: ["triptych", "phase", "evidence"],
  },
  WorksListEntry: {
    descriptionAlign: ["left", "center", "right", "justify"],
  },
  BilibiliEmbed: {
    captionAlign: ["left", "center", "right", "justify"],
  },
  ContactFlashlight: {
    taglineSubAlign: ["left", "center", "right", "justify"],
  },
};

const OPTIONAL_COMPONENT_PROPS: Partial<Record<PuckComponentType, readonly string[]>> = {
  BilibiliEmbed: ["caption"],
  BreakdownHeadline: ["indexLabel", "variant"],
  ContactFlashlight: [
    "anchorId",
    "copyErrorMessage",
    "copyLabel",
    "copySuccessMessage",
  ],
  EditorialSplit: [
    "imageFitMode",
    "imagePreset",
    "imageSrc",
    "paragraphs",
  ],
  HeroSection: [
    "imagePreset",
    "primaryCtaHref",
    "primaryCtaLabel",
    "secondaryCtaHref",
    "secondaryCtaLabel",
  ],
  ImagePanel: ["alt", "caption", "fitMode", "preset"],
  ImageSlider: ["imageFitMode", "imagePreset"],
  MetadataListItem: ["align"],
  ParameterGrid: ["imageFitMode", "imagePreset", "mediaSrc", "parameters"],
  ProjectCoverLink: ["imageFitMode", "imagePreset", "mediaSrc"],
  ThreeColumnSection: ["col1Items", "col2Items"],
  WorksListEntry: ["aliases", "imageFitMode", "imagePreset"],
};

const IMAGE_PRESET_VALUES = ["ratio-16-9", "ratio-21-9", "native"] as const;
const IMAGE_FIT_MODE_VALUES = ["x", "y", "cover"] as const;
const ALIAS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function makeIssue(pathName: string, message: string): ContentValidationIssue {
  return { message, path: pathName };
}

function valueMatchesKind(value: unknown, kind: PropKind) {
  if (kind === "array") return Array.isArray(value);
  if (kind === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === kind;
}

function validateProps(
  props: Record<string, unknown>,
  contract: PropContract,
  pathName: string,
  issues: ContentValidationIssue[],
  optionalKeys: readonly string[] = [],
) {
  for (const [key, value] of Object.entries(props)) {
    const expectedKind = contract[key];
    if (!expectedKind) {
      issues.push(makeIssue(`${pathName}.${key}`, `unknown prop "${key}"`));
      continue;
    }

    if (!valueMatchesKind(value, expectedKind)) {
      issues.push(makeIssue(`${pathName}.${key}`, `must be ${expectedKind}`));
    }

    if (
      expectedKind === "string" &&
      LINK_PROP_PATTERN.test(key) &&
      typeof value === "string" &&
      value.trim() &&
      toSafePuckHref(value) === undefined
    ) {
      issues.push(makeIssue(`${pathName}.${key}`, `contains an unsafe link`));
    }
  }

  for (const key of Object.keys(contract)) {
    if (!(key in props) && !optionalKeys.includes(key)) {
      issues.push(makeIssue(`${pathName}.${key}`, "is required"));
    }
  }
}

function isImagePresetKey(key: string) {
  return key === "preset" || key.endsWith("Preset");
}

function isImageFitModeKey(key: string) {
  return key === "fitMode" || key.endsWith("FitMode");
}

function getFitModeKeyForPreset(key: string) {
  return key === "preset" ? "fitMode" : key.replace(/Preset$/, "FitMode");
}

function validateLocalMediaPath(
  value: unknown,
  pathName: string,
  issues: ContentValidationIssue[],
  expected: "image" | "video" = "image",
) {
  if (typeof value !== "string" || value.length === 0) return;

  if (!isSupportedPublicMediaPath(value, expected)) {
    issues.push(
      makeIssue(
        pathName,
        `must reference a supported ${expected} file under /images or /uploads`,
      ),
    );
  }
}

function validateStructuredArray(
  componentType: PuckComponentType,
  key: string,
  value: unknown[],
  pathName: string,
  issues: ContentValidationIssue[],
) {
  if (componentType === "WorksListEntry" && key === "aliases") {
    value.forEach((alias, index) => {
      const aliasPath = `${pathName}[${index}]`;
      if (!isPlainRecord(alias)) {
        issues.push(makeIssue(aliasPath, "must be an object"));
        return;
      }
      for (const aliasKey of Object.keys(alias)) {
        if (aliasKey !== "slug") {
          issues.push(makeIssue(`${aliasPath}.${aliasKey}`, `unknown alias field "${aliasKey}"`));
        }
      }
      if (typeof alias.slug !== "string" || !ALIAS_SLUG_PATTERN.test(alias.slug)) {
        issues.push(makeIssue(`${aliasPath}.slug`, "must be a canonical lowercase slug"));
      }
    });
  }

  if (componentType === "ParameterGrid" && key === "parameters") {
    value.forEach((parameter, index) => {
      const parameterPath = `${pathName}[${index}]`;
      if (!isPlainRecord(parameter)) {
        issues.push(makeIssue(parameterPath, "must be an object"));
        return;
      }
      for (const parameterKey of Object.keys(parameter)) {
        if (!["description", "descriptionAlign", "name", "value"].includes(parameterKey)) {
          issues.push(makeIssue(
            `${parameterPath}.${parameterKey}`,
            `unknown parameter field "${parameterKey}"`,
          ));
        }
      }
      for (const requiredKey of ["description", "descriptionAlign", "name"] as const) {
        if (typeof parameter[requiredKey] !== "string") {
          issues.push(makeIssue(`${parameterPath}.${requiredKey}`, "must be string"));
        }
      }
      if (
        typeof parameter.descriptionAlign === "string" &&
        !["left", "center", "right", "justify"].includes(
          parameter.descriptionAlign,
        )
      ) {
        issues.push(makeIssue(
          `${parameterPath}.descriptionAlign`,
          "must be one of left, center, right, justify",
        ));
      }
      if (parameter.value !== undefined && typeof parameter.value !== "string") {
        issues.push(makeIssue(`${parameterPath}.value`, "must be string when provided"));
      }
    });
  }
}

function validateNode(
  node: unknown,
  pathName: string,
  issues: ContentValidationIssue[],
  seenIds: Map<string, string>,
) {
  if (!isPlainRecord(node)) {
    issues.push(makeIssue(pathName, "component node must be an object"));
    return;
  }

  for (const key of Object.keys(node)) {
    if (key !== "props" && key !== "type") {
      issues.push(makeIssue(`${pathName}.${key}`, `unknown component field "${key}"`));
    }
  }

  if (typeof node.type !== "string" || !PUCK_COMPONENT_TYPE_SET.has(node.type)) {
    issues.push(makeIssue(`${pathName}.type`, `unknown component type "${String(node.type)}"`));
    return;
  }

  if (!isPlainRecord(node.props)) {
    issues.push(makeIssue(`${pathName}.props`, "must be an object"));
    return;
  }

  validateProps(
    node.props,
    PAGE_COMPONENT_PROP_CONTRACTS[node.type as PuckComponentType],
    `${pathName}.props`,
    issues,
    [
      ...(OPTIONAL_COMPONENT_PROPS[node.type as PuckComponentType] ?? []),
      "editorDisplayName",
    ],
  );

  if ("editorDisplayName" in node.props) {
    const editorDisplayName = node.props.editorDisplayName;
    if (
      typeof editorDisplayName !== "string" ||
      editorDisplayName.trim().length === 0 ||
      editorDisplayName !== editorDisplayName.trim()
    ) {
      issues.push(makeIssue(
        `${pathName}.props.editorDisplayName`,
        "must be a non-empty trimmed string when provided",
      ));
    } else if (editorDisplayName.length > 80) {
      issues.push(makeIssue(
        `${pathName}.props.editorDisplayName`,
        "must be at most 80 characters",
      ));
    }
  }

  if (typeof node.props.id !== "string" || node.props.id.trim().length === 0) {
    issues.push(makeIssue(`${pathName}.props.id`, "must be a non-empty string"));
  } else {
    const previousPath = seenIds.get(node.props.id);
    if (previousPath) {
      issues.push(makeIssue(`${pathName}.props.id`, `duplicates id used at ${previousPath}`));
    } else {
      seenIds.set(node.props.id, `${pathName}.props.id`);
    }
  }

  const componentType = node.type as PuckComponentType;
  const enums = PROP_ENUMS[componentType];
  for (const [key, allowedValues] of Object.entries(enums ?? {})) {
    const value = node.props[key];
    if (value !== undefined && !allowedValues.includes(value)) {
      issues.push(makeIssue(`${pathName}.props.${key}`, `must be one of ${allowedValues.join(", ")}`));
    }
  }

  for (const key of ["initialPosition", "mobileImageFocalX", "mobileImageFocalY"] as const) {
    const value = node.props[key];
    if (typeof value === "number" && (value < 0 || value > 100)) {
      issues.push(makeIssue(`${pathName}.props.${key}`, "must be between 0 and 100"));
    }
  }

  if (typeof node.props.index === "number" && (!Number.isInteger(node.props.index) || node.props.index < 0)) {
    issues.push(makeIssue(`${pathName}.props.index`, "must be a non-negative integer"));
  }

  for (const [key, value] of Object.entries(node.props)) {
    if (isImagePresetKey(key) && !IMAGE_PRESET_VALUES.includes(value as never)) {
      issues.push(makeIssue(`${pathName}.props.${key}`, `must be one of ${IMAGE_PRESET_VALUES.join(", ")}`));
    }
    if (isImageFitModeKey(key) && !IMAGE_FIT_MODE_VALUES.includes(value as never)) {
      issues.push(makeIssue(`${pathName}.props.${key}`, `must be one of ${IMAGE_FIT_MODE_VALUES.join(", ")}`));
    }

    if (Array.isArray(value)) {
      const allowedTypes = SLOT_COMPONENTS[componentType]?.[key];
      if (allowedTypes) {
        value.forEach((entry, index) => {
          const itemPath = `${pathName}.props.${key}[${index}]`;
          if (!isPlainRecord(entry) || typeof entry.type !== "string") {
            issues.push(makeIssue(itemPath, "slot entry must be a component node"));
            return;
          }

          if (!allowedTypes.includes(entry.type as PuckComponentType)) {
            issues.push(makeIssue(`${itemPath}.type`, `slot does not allow component type "${entry.type}"`));
          }
          validateNode(entry, itemPath, issues, seenIds);
        });
      } else {
        validateStructuredArray(
          componentType,
          key,
          value,
          `${pathName}.props.${key}`,
          issues,
        );
      }
    }

    if (isImagePresetKey(key) && value === "native") {
      const fitModeKey = getFitModeKeyForPreset(key);
      const fitMode = node.props[fitModeKey];
      if (fitMode === "cover" || fitMode === "y") {
        issues.push(makeIssue(
          `${pathName}.props.${fitModeKey}`,
          `native image preset cannot use ${fitMode} fit mode`,
        ));
      }
    }
  }

  const imagePathKeys = [
    "col1MediaSrc",
    "col2MediaSrc",
    "col3MediaSrc",
    "heroImage",
    "imageSrc",
    "litSrc",
    "src",
    "unlitSrc",
  ];
  for (const key of imagePathKeys) {
    if (key in node.props) {
      validateLocalMediaPath(node.props[key], `${pathName}.props.${key}`, issues);
    }
  }
  if ("mediaSrc" in node.props) {
    validateLocalMediaPath(
      node.props.mediaSrc,
      `${pathName}.props.mediaSrc`,
      issues,
    );
  }

  if (componentType === "BilibiliEmbed") {
    if (parseBilibiliVideoSource(node.props.source) === null) {
      issues.push(makeIssue(
        `${pathName}.props.source`,
        "must be a BV id or a standard bilibili.com/video/BV… URL",
      ));
    }
    if (
      typeof node.props.title !== "string" ||
      node.props.title.trim().length === 0
    ) {
      issues.push(makeIssue(
        `${pathName}.props.title`,
        "must be a non-empty accessibility title",
      ));
    }
  }
}

function validateNodeArray(
  value: unknown,
  pathName: string,
  issues: ContentValidationIssue[],
  seenIds: Map<string, string>,
) {
  if (!Array.isArray(value)) {
    issues.push(makeIssue(pathName, "must be an array"));
    return;
  }

  value.forEach((node, index) => validateNode(node, `${pathName}[${index}]`, issues, seenIds));
}

export function validateCurrentPageDocument(value: unknown): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const seenIds = new Map<string, string>();
  if (!isPlainRecord(value)) {
    return [makeIssue("$", "page document must be an object")];
  }

  for (const key of Object.keys(value)) {
    if (!new Set(["content", "root", "version", "zones"]).has(key)) {
      issues.push(makeIssue(`$.${key}`, `unknown top-level field "${key}"`));
    }
  }

  if (value.version !== PAGE_DOCUMENT_VERSION) {
    issues.push(makeIssue("$.version", `must equal ${PAGE_DOCUMENT_VERSION}`));
  }

  if (!isPlainRecord(value.root) || !isPlainRecord(value.root.props)) {
    issues.push(makeIssue("$.root.props", "must be an object"));
  } else {
    for (const key of Object.keys(value.root)) {
      if (key !== "props") {
        issues.push(makeIssue(`$.root.${key}`, `unknown root field "${key}"`));
      }
    }
    validateProps(value.root.props, ROOT_PROP_CONTRACT, "$.root.props", issues);
    for (const key of Object.keys(ROOT_PROP_CONTRACT)) {
      if (!(key in value.root.props)) {
        issues.push(makeIssue(`$.root.props.${key}`, "is required"));
      }
    }
    validateLocalMediaPath(value.root.props.image, "$.root.props.image", issues);
  }

  validateNodeArray(value.content, "$.content", issues, seenIds);

  if (!isPlainRecord(value.zones)) {
    issues.push(makeIssue("$.zones", "must be a record of arrays"));
  } else {
    for (const [zoneName, zone] of Object.entries(value.zones)) {
      validateNodeArray(zone, `$.zones.${zoneName}`, issues, seenIds);
    }
  }

  return issues;
}

function removeLegacyProps(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeLegacyProps);
  if (!isPlainRecord(value)) return value;

  const nextValue = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, removeLegacyProps(entry)]),
  );

  if (nextValue.type === "ContentCard" && isPlainRecord(nextValue.props)) {
    delete nextValue.props.tags;
  }

  if (nextValue.type === "NextProjectBlock" && isPlainRecord(nextValue.props)) {
    delete nextValue.props.href;
    delete nextValue.props.nextBg;
    delete nextValue.props.nextName;
  }

  if (
    nextValue.type === "TextSplitLayout" &&
    isPlainRecord(nextValue.props) &&
    Array.isArray(nextValue.props.paragraphs)
  ) {
    const parentId = typeof nextValue.props.id === "string" ? nextValue.props.id : "text-split";
    nextValue.props.paragraphs = nextValue.props.paragraphs.map((paragraph, index) => (
      typeof paragraph === "string"
        ? {
          props: { id: `${parentId}-paragraph-${index + 1}`, text: paragraph },
          type: "TextParagraphBlock",
        }
        : paragraph
    ));
  }

  return nextValue;
}

function removeRuntimeProjectionProps(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeRuntimeProjectionProps);
  if (!isPlainRecord(value)) return value;

  const nextValue = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, removeRuntimeProjectionProps(entry)]),
  );
  if (nextValue.type === "NextProjectBlock" && isPlainRecord(nextValue.props)) {
    delete nextValue.props.href;
    delete nextValue.props.nextBg;
    delete nextValue.props.nextName;
  }

  return nextValue;
}

function normalizeEditorMetadata(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeEditorMetadata);
  if (!isPlainRecord(value)) return value;

  const nextValue = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, normalizeEditorMetadata(entry)]),
  );
  if (isPlainRecord(nextValue.props) && "editorDisplayName" in nextValue.props) {
    const rawName = nextValue.props.editorDisplayName;
    if (typeof rawName !== "string") return nextValue;
    const normalizedName = rawName.trim().slice(0, 80);
    if (normalizedName) nextValue.props.editorDisplayName = normalizedName;
    else delete nextValue.props.editorDisplayName;
  }

  return nextValue;
}

export function stripPageEditorMetadata<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripPageEditorMetadata(entry)) as T;
  }
  if (!isPlainRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "editorDisplayName")
      .map(([key, entry]) => [key, stripPageEditorMetadata(entry)]),
  ) as T;
}

export function migrateLegacyPageDocument(value: unknown): unknown {
  assertPageDocumentBudget(value);
  if (
    !isPlainRecord(value) ||
    value.version !== undefined ||
    !Array.isArray(value.content) ||
    !isPlainRecord(value.root) ||
    !isPlainRecord(value.root.props) ||
    (value.zones !== undefined && !isPlainRecord(value.zones))
  ) {
    return value;
  }

  const normalized = removeLegacyProps(normalizePuckData(value));
  if (!isPlainRecord(normalized)) return normalized;

  const normalizedRootProps = isPlainRecord(normalized.root) && isPlainRecord(normalized.root.props)
    ? normalized.root.props
    : {};
  const legacyTitle = typeof normalizedRootProps.title === "string" && normalizedRootProps.title.trim()
    ? normalizedRootProps.title
    : "Untitled";

  return {
    content: Array.isArray(normalized.content) ? normalized.content : [],
    root: {
      props: {
        description:
          typeof normalizedRootProps.description === "string" && normalizedRootProps.description.trim()
            ? normalizedRootProps.description
            : legacyTitle,
        image:
          typeof normalizedRootProps.image === "string"
            ? normalizedRootProps.image
            : "",
        noIndex:
          typeof normalizedRootProps.noIndex === "boolean"
            ? normalizedRootProps.noIndex
            : false,
        title: legacyTitle,
      },
    },
    version: PAGE_DOCUMENT_VERSION,
    zones: isPlainRecord(normalized.zones) ? normalized.zones : {},
  };
}

export function normalizePageDraft(value: unknown): unknown {
  assertPageDocumentBudget(value);
  if (isPlainRecord(value) && value.version === PAGE_DOCUMENT_VERSION) {
    return normalizeEditorMetadata(
      removeRuntimeProjectionProps(normalizePuckData(value)),
    );
  }

  if (isPlainRecord(value) && value.version !== undefined) {
    return value;
  }

  return migrateLegacyPageDocument(value);
}

function parseStrictPageDocument(value: unknown): PageDocument {
  const candidate = value;
  assertPageDocumentBudget(candidate);
  const issues = validateCurrentPageDocument(candidate);
  if (issues.length > 0) {
    throw new PageDocumentValidationError(issues);
  }

  return candidate as PageDocument;
}

export function parseCurrentPageDocument(value: unknown): PageDocument {
  return parseStrictPageDocument(value);
}

export function parseEditorPageDraft(value: unknown): PageDocument {
  return parseStrictPageDocument(normalizePageDraft(value));
}

export function parsePageDocument(value: unknown): PageDocument {
  return parseCurrentPageDocument(value);
}

export function validatePageReferences(
  document: PageDocument,
  publicRoot: string,
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const directoryCache = new Map<string, Set<string>>();

  for (const reference of collectImageLikeReferences(document)) {
    if (/\/placeholder(?:[./-]|$)/i.test(reference.value)) {
      issues.push(makeIssue(reference.path, `public content cannot use placeholder image "${reference.value}"`));
      continue;
    }

    const relativePath = reference.value.replace(/^\//, "");
    const status = hasExactCasePath(publicRoot, relativePath, directoryCache);
    if (status === "missing") {
      issues.push(makeIssue(reference.path, `public image "${reference.value}" does not exist`));
    } else if (status === "case-mismatch") {
      issues.push(makeIssue(reference.path, `public image "${reference.value}" must match exact filesystem casing`));
    }
  }

  const rootImage = document.root.props.image;
  if (rootImage?.startsWith("/")) {
    const status = hasExactCasePath(publicRoot, rootImage.replace(/^\//, ""), directoryCache);
    if (status !== "ok") {
      issues.push(makeIssue("$.root.props.image", `metadata image "${rootImage}" is ${status}`));
    }
  }

  return issues;
}

export class PageDocumentValidationError extends Error {
  readonly code = "INVALID_CONTENT";
  readonly issues: ContentValidationIssue[];

  constructor(issues: ContentValidationIssue[]) {
    super("Page document failed strict validation");
    this.name = "PageDocumentValidationError";
    this.issues = issues;
  }
}
