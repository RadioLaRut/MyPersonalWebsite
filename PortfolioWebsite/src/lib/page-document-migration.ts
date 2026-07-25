import { areJsonStructuresEqual, isPlainRecord } from "./json-utils.ts";
import {
  PAGE_DOCUMENT_VERSION,
  type PageDocument,
  migrateLegacyPageDocument,
  normalizePageDraft,
  parseCurrentPageDocument,
} from "./page-document-contract.ts";

const IMAGE_KEYS = [
  "heroImage",
  "coverImage",
  "imageSrc",
  "src",
  "mediaSrc",
  "litSrc",
  "unlitSrc",
  "phase3ImageSrc",
  "col1Img",
  "col2Img",
  "col3Img",
] as const;

export type PageDocumentMigrationOptions = {
  description?: string;
  noIndex?: boolean;
};

export type PageDocumentMigrationResult = {
  document: PageDocument;
  migrated: boolean;
};

function findFirstImage(value: unknown): string {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const image = findFirstImage(entry);
      if (image) return image;
    }
    return "";
  }
  if (!isPlainRecord(value)) return "";

  if (isPlainRecord(value.props)) {
    for (const key of IMAGE_KEYS) {
      const candidate = value.props[key];
      if (
        typeof candidate === "string" &&
        /^\/(?:images|uploads)\//.test(candidate) &&
        !/\.(?:mp4|webm)$/i.test(candidate)
      ) {
        return candidate;
      }
    }
  }

  for (const entry of Object.values(value)) {
    const image = findFirstImage(entry);
    if (image) return image;
  }
  return "";
}

export function preparePageDocumentMigration(
  value: unknown,
  options: PageDocumentMigrationOptions = {},
): PageDocumentMigrationResult {
  if (isPlainRecord(value) && value.version === PAGE_DOCUMENT_VERSION) {
    const normalized = normalizePageDraft(value);
    return {
      document: parseCurrentPageDocument(normalized),
      migrated: !areJsonStructuresEqual(value, normalized),
    };
  }

  if (isPlainRecord(value) && value.version !== undefined) {
    return {
      document: parseCurrentPageDocument(value),
      migrated: false,
    };
  }

  const migratedValue = migrateLegacyPageDocument(value);
  if (
    !isPlainRecord(migratedValue) ||
    !isPlainRecord(migratedValue.root) ||
    !isPlainRecord(migratedValue.root.props)
  ) {
    return {
      document: parseCurrentPageDocument(migratedValue),
      migrated: true,
    };
  }

  const migratedDescription = migratedValue.root.props.description;
  const description = options.description?.trim() || (
    typeof migratedDescription === "string" ? migratedDescription : ""
  );
  const currentImage = migratedValue.root.props.image;
  const candidate = {
    ...migratedValue,
    root: {
      ...migratedValue.root,
      props: {
        ...migratedValue.root.props,
        description,
        image: typeof currentImage === "string" && currentImage
          ? currentImage
          : findFirstImage(migratedValue.content),
        noIndex: options.noIndex ?? false,
      },
    },
  };

  return {
    document: parseCurrentPageDocument(candidate),
    migrated: true,
  };
}
