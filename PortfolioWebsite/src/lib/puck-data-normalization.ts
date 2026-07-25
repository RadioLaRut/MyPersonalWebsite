import { isNonEmptyString, isPlainRecord } from "./json-utils.ts";
import { PUCK_COMPONENT_TYPE_SET } from "../puck/component-manifest.ts";

const COMPONENT_TYPE_ALIASES: Record<string, string> = {
  BreakdownTriptych: "ThreeColumnSection",
  ContentCard: "EditorialSplit",
  Heroheadline: "HeroHeadline",
  HighDensityInfoBlock: "ThreeColumnSection",
  LightingCollectionItem: "ImagePanel",
  LightingCollectionHeader: "EditorialHeader",
  LightingProjectCard: "ProjectCoverLink",
  PortfolioHeroHeader: "EditorialHeader",
  ProjectSection: "ProjectCoverLink",
  TextSplitLayout: "EditorialSplit",
};

const ITEM_DEFAULT_PROPS: Record<string, Record<string, unknown>> = {
  BilibiliEmbed: {
    caption: "",
    captionAlign: "left",
    source: "",
    title: "B 站视频",
  },
  ContactFlashlight: {
    taglineSubAlign: "left",
  },
  EditorialHeader: {
    backHref: "",
    ctaHref: "",
    ctaLabel: "",
    description: "",
    descriptionAlign: "left",
    descriptionLine1: "",
    descriptionLine2: "",
    number: "",
    subtitle: "",
    title: "",
    variant: "index",
  },
  EditorialSplit: {
    body: "",
    bodyAlign: "left",
    bodyMode: "plain",
    heading: "",
    imageFitMode: "x",
    imagePreset: "ratio-16-9",
    imageSrc: "",
    layout: "media-right",
    paragraphs: [],
  },
  HeroHeadline: {
    eyebrow: "PROJECT",
    title: "PROJECT TITLE",
    subtitle: "Add a short project summary.",
    subtitleAlign: "left",
    heroImage: "/images/train-station/2Day.webp",
    heroImagePreset: "ratio-21-9",
    heroImageFitMode: "x",
    navLink: "",
    navLinkLabel: "观看视频",
  },
  HeroSection: {
    descriptionAlign: "left",
  },
  HomeEndcapSection: {
    descriptionAlign: "center",
  },
  ImagePanel: {
    captionAlign: "left",
  },
  ProjectCoverLink: {
    align: "auto",
    href: "",
    imageFitMode: "x",
    imagePreset: "ratio-21-9",
    index: 0,
    mediaSrc: "",
    mobileImageFocalX: 50,
    mobileImageFocalY: 50,
    number: "",
    subtitle: "",
    title: "",
    variant: "immersive",
  },
  RichParagraph: {
    align: "justify",
  },
  TextParagraphBlock: {
    align: "left",
  },
  ThreeColumnSection: {
    col1BodyAlign: "left",
    col2BodyAlign: "left",
    col3BodyAlign: "left",
    rhythm: "aligned",
    variant: "triptych",
  },
  WorksListEntry: {
    descriptionAlign: "left",
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
  const metadata = {
    ...(typeof props.id === "string" ? { id: props.id } : {}),
    ...(typeof props.editorDisplayName === "string"
      ? { editorDisplayName: props.editorDisplayName }
      : {}),
  };

  if (rawType === "PortfolioHeroHeader") {
    return {
      ...metadata,
      backHref: "",
      ctaHref: props.ctaHref ?? "",
      ctaLabel: props.ctaLabel ?? "",
      description: "",
      descriptionAlign: "left",
      descriptionLine1: props.descriptionLine1 ?? "",
      descriptionLine2: props.descriptionLine2 ?? "",
      number: "",
      subtitle: props.subtitle ?? "",
      title: props.title ?? "",
      variant: "index",
    };
  }

  if (rawType === "LightingCollectionHeader") {
    return {
      ...metadata,
      backHref: props.backHref ?? "",
      ctaHref: "",
      ctaLabel: "",
      description: props.description ?? "",
      descriptionAlign: "right",
      descriptionLine1: "",
      descriptionLine2: "",
      number: props.number ?? "",
      subtitle: "",
      title: props.title ?? "",
      variant: "collection",
    };
  }

  if (rawType === "ContentCard") {
    return {
      ...metadata,
      body: props.description ?? "",
      bodyAlign: "left",
      bodyMode: "plain",
      heading: props.title ?? "",
      imageFitMode: props.imageFitMode ?? "x",
      imagePreset: props.imagePreset ?? "ratio-16-9",
      imageSrc: props.imageSrc ?? "",
      layout: props.imagePosition === "left" ? "media-left" : "media-right",
      paragraphs: [],
    };
  }

  if (rawType === "TextSplitLayout") {
    const layout = props.layoutVariant === "split-right"
      ? "media-right"
      : props.layoutVariant === "stack"
        ? "stack"
        : "media-left";
    const parentId = typeof props.id === "string" ? props.id : "editorial-split";
    const paragraphs = Array.isArray(props.paragraphs)
      ? props.paragraphs.map((paragraph, index) => (
        typeof paragraph === "string"
          ? {
            props: {
              align: layout === "stack" ? "center" : "left",
              id: `${parentId}-paragraph-${index + 1}`,
              text: paragraph,
            },
            type: "TextParagraphBlock",
          }
          : paragraph
      ))
      : [];
    return {
      ...metadata,
      body: "",
      bodyAlign: layout === "stack" ? "center" : "left",
      bodyMode: "slot",
      heading: props.heading ?? "",
      imageFitMode: props.imageFitMode ?? "x",
      imagePreset: props.imagePreset ?? "ratio-16-9",
      imageSrc: props.imageSrc ?? "",
      layout,
      paragraphs,
    };
  }

  if (rawType === "BreakdownTriptych") {
    const migrated: Record<string, unknown> = {
      ...metadata,
      col1Items: [],
      col2Items: [],
      rhythm: "staggered",
      variant: "triptych",
    };
    for (const column of [1, 2, 3] as const) {
      migrated[`col${column}Body`] = props[`col${column}Text`] ?? "";
      migrated[`col${column}BodyAlign`] = "left";
      migrated[`col${column}Label`] = "";
      migrated[`col${column}MediaFitMode`] =
        props[`col${column}FitMode`] ?? "x";
      migrated[`col${column}MediaPreset`] =
        props[`col${column}Preset`] ?? "ratio-16-9";
      migrated[`col${column}MediaSrc`] = props[`col${column}Img`] ?? "";
      migrated[`col${column}Subtitle`] = "";
      migrated[`col${column}Title`] = props[`col${column}Title`] ?? "";
    }
    return migrated;
  }

  if (rawType === "HighDensityInfoBlock") {
    const migrated: Record<string, unknown> = {
      ...metadata,
      col1Items: props.phase1Items ?? [],
      col2Items: props.phase2Items ?? [],
      rhythm: "aligned",
      variant: "phase",
    };
    for (const column of [1, 2, 3] as const) {
      migrated[`col${column}Body`] = props[`phase${column}Content`] ?? "";
      migrated[`col${column}BodyAlign`] = "left";
      migrated[`col${column}Label`] = props[`phase${column}Label`] ?? "";
      migrated[`col${column}MediaFitMode`] = column === 3
        ? props.phase3ImageFitMode ?? "x"
        : "x";
      migrated[`col${column}MediaPreset`] = column === 3
        ? props.phase3ImagePreset ?? "ratio-16-9"
        : "ratio-16-9";
      migrated[`col${column}MediaSrc`] = column === 3
        ? props.phase3ImageSrc ?? ""
        : "";
      migrated[`col${column}Subtitle`] =
        props[`phase${column}Subtitle`] ?? "";
      migrated[`col${column}Title`] = props[`phase${column}Title`] ?? "";
    }
    return migrated;
  }

  if (rawType === "ProjectSection") {
    return {
      ...metadata,
      align: props.align ?? "auto",
      href: props.link ?? "",
      imageFitMode: props.imageFitMode ?? "x",
      imagePreset: props.imagePreset ?? "ratio-16-9",
      index: props.index ?? 0,
      mediaSrc: props.imageSrc ?? "",
      mobileImageFocalX: props.mobileImageFocalX ?? 50,
      mobileImageFocalY: props.mobileImageFocalY ?? 50,
      number: "",
      subtitle: props.subtitle ?? "",
      title: props.title ?? "",
      variant: "immersive",
    };
  }

  if (rawType === "LightingProjectCard") {
    return {
      ...metadata,
      align: "auto",
      href: props.href ?? "",
      imageFitMode: props.imageFitMode ?? "cover",
      imagePreset: props.imagePreset ?? "ratio-21-9",
      index: 0,
      mediaSrc: props.coverImage ?? "",
      mobileImageFocalX: 50,
      mobileImageFocalY: 50,
      number: props.number ?? "",
      subtitle: "",
      title: props.title ?? "",
      variant: "card",
    };
  }

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

  if (type === "ParameterGrid") {
    delete nextProps.isVideo;
    if (Array.isArray(nextProps.parameters)) {
      nextProps.parameters = nextProps.parameters.map((parameter) => {
        if (!isPlainRecord(parameter)) return parameter;
        return {
          ...parameter,
          descriptionAlign:
            typeof parameter.descriptionAlign === "string"
              ? parameter.descriptionAlign
              : "left",
        };
      });
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
