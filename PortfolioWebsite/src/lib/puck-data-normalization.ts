const COMPONENT_TYPE_ALIASES: Record<string, string> = {
  Heroheadline: "HeroHeadline",
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

  LightingCollectionItem: {
    src: "/images/train-station/2Day.webp",
    caption: "IMAGE",
    preset: "ratio-16-9",
    fitMode: "x",
  },
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeComponentType(type: string) {
  return COMPONENT_TYPE_ALIASES[type] ?? type;
}

function isBlankText(value: unknown) {
  return typeof value !== "string" || value.trim().length === 0;
}

function shouldHydrateUninitializedProps(type: string, props: Record<string, unknown>) {
  if (type === "HeroHeadline") {
    return ["eyebrow", "title", "subtitle", "heroImage", "navLink"].every((key) => isBlankText(props[key]));
  }

  if (type === "LightingCollectionItem") {
    return isBlankText(props.src) && isBlankText(props.caption);
  }

  return false;
}

function applyLegacyPropAliases(type: string, props: Record<string, unknown>) {
  const nextProps = { ...props };

  if (type === "LightingCollectionItem" && typeof nextProps.src !== "string") {
    if (typeof nextProps.lit === "string" && nextProps.lit.length > 0) {
      nextProps.src = nextProps.lit;
    }
  }

  if (type === "ImageSlider") {
    if (typeof nextProps.unlitSrc !== "string" && typeof nextProps.leftImage === "string") {
      nextProps.unlitSrc = nextProps.leftImage;
    }

    if (typeof nextProps.litSrc !== "string" && typeof nextProps.rightImage === "string") {
      nextProps.litSrc = nextProps.rightImage;
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

function normalizeNode(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeNode(entry));
  }

  if (!isPlainRecord(value)) {
    return value;
  }

  const normalizedRecord: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    normalizedRecord[key] = normalizeNode(entry);
  }

  const rawType = normalizedRecord.type;
  if (typeof rawType !== "string") {
    return normalizedRecord;
  }

  const normalizedType = normalizeComponentType(rawType);
  const shouldNormalizeItem =
    "props" in normalizedRecord ||
    normalizedType in ITEM_DEFAULT_PROPS ||
    rawType in COMPONENT_TYPE_ALIASES;

  if (!shouldNormalizeItem) {
    return normalizedRecord;
  }

  const normalizedProps = isPlainRecord(normalizedRecord.props) ? normalizedRecord.props : {};

  normalizedRecord.type = normalizedType;
  normalizedRecord.props = hydrateMissingProps(
    normalizedType,
    applyLegacyPropAliases(normalizedType, normalizedProps),
  );

  return normalizedRecord;
}

export function normalizePuckData<T>(data: T): T {
  return normalizeNode(data) as T;
}
