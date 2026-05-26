import { isNonEmptyString, isPlainRecord } from "./json-utils.ts";
import { PUCK_COMPONENT_TYPE_SET } from "../puck/component-manifest.ts";

const COMPONENT_TYPE_ALIASES: Record<string, string> = {
  Heroheadline: "HeroHeadline",
  LightingCollectionItem: "ImagePanel",
};

const ITEM_DEFAULT_PROPS: Record<string, Record<string, unknown>> = {
  HeroHeadline: {
    eyebrow: "PROJECT",
    title: "PROJECT TITLE",
    subtitle: "Add a short project summary.",
    heroImage: "/images/train-station/2Day.webp",
    heroImagePreset: "ratio-21-9",
    heroImageFitMode: "x",
    navLink: "",
  },
};

export { isPlainRecord };

function normalizeComponentType(type: string) {
  return COMPONENT_TYPE_ALIASES[type] ?? type;
}

function isBlankText(value: unknown) {
  return !isNonEmptyString(value);
}

function hashString(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function generateStableComponentId(type: string, pathKey: string) {
  return `${type}-${hashString(`${type}:${pathKey}`)}`;
}

function shouldHydrateUninitializedProps(type: string, props: Record<string, unknown>) {
  if (type === "HeroHeadline") {
    return ["eyebrow", "title", "subtitle", "heroImage", "navLink"].every((key) => isBlankText(props[key]));
  }
  return false;
}

function applyLegacyPropAliases(type: string, props: Record<string, unknown>, rawType = type) {
  const nextProps = { ...props };
  if (type === "ImageSlider") {
    if (typeof nextProps.unlitSrc !== "string" && typeof nextProps.leftImage === "string") {
      nextProps.unlitSrc = nextProps.leftImage;
    }

    if (typeof nextProps.litSrc !== "string" && typeof nextProps.rightImage === "string") {
      nextProps.litSrc = nextProps.rightImage;
    }
  }

  if (rawType === "LightingCollectionItem") {
    if (typeof nextProps.src !== "string" && typeof nextProps.lit === "string") {
      nextProps.src = nextProps.lit;
    }

    if (typeof nextProps.caption !== "string" || nextProps.caption.trim().length === 0) {
      nextProps.caption = "IMAGE";
    }

    if (typeof nextProps.variant !== "string") {
      nextProps.variant = "large";
    }
  }

  if (type === "NextProjectBlock") {
    if (typeof nextProps.href !== "string" || nextProps.href.trim().length === 0) {
      if (typeof nextProps.nextId === "string" && nextProps.nextId.trim().length > 0) {
        nextProps.href = `/works/${nextProps.nextId.trim()}`;
      }
    }
  }

  return nextProps;
}

function hydrateMissingProps(type: string, props: Record<string, unknown>) {
  const defaults = ITEM_DEFAULT_PROPS[type];
  if (!defaults) {
    return props;
  }

  const nextProps = { ...props };
  const shouldHydrateBlanks = shouldHydrateUninitializedProps(type, nextProps);

  for (const [key, value] of Object.entries(defaults)) {
    if (
      nextProps[key] === undefined ||
      nextProps[key] === null ||
      (shouldHydrateBlanks && isBlankText(nextProps[key]))
    ) {
      nextProps[key] = value;
    }
  }

  return nextProps;
}

function normalizeNode(value: unknown, pathParts: string[] = []): unknown {
  if (Array.isArray(value)) {
    return value.map((entry, index) => normalizeNode(entry, [...pathParts, String(index)]));
  }

  if (!isPlainRecord(value)) {
    return value;
  }

  const normalizedRecord: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    normalizedRecord[key] = normalizeNode(entry, [...pathParts, key]);
  }

  const rawType = normalizedRecord.type;
  if (typeof rawType !== "string") {
    return normalizedRecord;
  }

  const normalizedType = normalizeComponentType(rawType);
  const shouldNormalizeItem =
    "props" in normalizedRecord ||
    normalizedType in ITEM_DEFAULT_PROPS ||
    rawType in COMPONENT_TYPE_ALIASES ||
    PUCK_COMPONENT_TYPE_SET.has(normalizedType);

  if (!shouldNormalizeItem) {
    return normalizedRecord;
  }

  const normalizedProps = isPlainRecord(normalizedRecord.props) ? normalizedRecord.props : {};

  normalizedRecord.type = normalizedType;
  const nextProps = hydrateMissingProps(
    normalizedType,
    applyLegacyPropAliases(normalizedType, normalizedProps, rawType),
  );

  if (isBlankText(nextProps.id)) {
    nextProps.id = generateStableComponentId(normalizedType, pathParts.join("."));
  }

  normalizedRecord.props = nextProps;

  return normalizedRecord;
}

export function normalizePuckData<T>(data: T): T {
  return normalizeNode(data) as T;
}
