export const IMAGE_LIBRARY_PUBLIC_ROOT = "/images";
export const DEFAULT_UPLOAD_PUBLIC_DIRECTORY =
  `${IMAGE_LIBRARY_PUBLIC_ROOT}/${["puck"].join("")}`;

export const SUPPORTED_IMAGE_EXTENSIONS = [
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
] as const;

export const SUPPORTED_VIDEO_EXTENSIONS = [".mp4", ".webm"] as const;

export type MediaAssetKind = "image" | "video";
export type ImageLibraryEntryKind = "directory" | MediaAssetKind;

export type ImageLibraryEntry = {
  kind: ImageLibraryEntryKind;
  name: string;
  path: string;
};

export type ImageLibraryResponse = {
  directory: string;
  entries: ImageLibraryEntry[];
  parent: string | null;
};

const SUPPORTED_IMAGE_EXTENSION_SET = new Set<string>(SUPPORTED_IMAGE_EXTENSIONS);
const SUPPORTED_VIDEO_EXTENSION_SET = new Set<string>(SUPPORTED_VIDEO_EXTENSIONS);
const PUBLIC_MEDIA_ROOTS = new Set(["images", "uploads"]);
const DISALLOWED_SEGMENT_CHARACTER_PATTERN = /[\u0000-\u001f\u007f<>:"#|?*\\%]/u;
const WINDOWS_RESERVED_SEGMENT_PATTERN =
  /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu;
const MAX_PUBLIC_PATH_LENGTH = 2_048;
const MAX_PATH_SEGMENT_CODE_POINTS = 255;

function codePointLength(value: string) {
  return Array.from(value).length;
}

export function isSafePublicPathSegment(segment: string) {
  return (
    segment.length > 0 &&
    segment === segment.trim() &&
    segment !== "." &&
    segment !== ".." &&
    !segment.startsWith(".") &&
    !segment.endsWith(".") &&
    !DISALLOWED_SEGMENT_CHARACTER_PATTERN.test(segment) &&
    !WINDOWS_RESERVED_SEGMENT_PATTERN.test(segment) &&
    codePointLength(segment) <= MAX_PATH_SEGMENT_CODE_POINTS
  );
}

function splitCanonicalPublicPath(
  value: string,
  allowedRoots: ReadonlySet<string>,
) {
  if (
    value.length === 0 ||
    value.length > MAX_PUBLIC_PATH_LENGTH ||
    value !== value.trim() ||
    !value.startsWith("/") ||
    value.endsWith("/")
  ) {
    return null;
  }

  const segments = value.slice(1).split("/");
  if (
    segments.length === 0 ||
    !allowedRoots.has(segments[0]) ||
    segments.some((segment) => !isSafePublicPathSegment(segment))
  ) {
    return null;
  }

  return segments;
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex > 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function getMediaAssetKind(value: string): MediaAssetKind | null {
  const segments = splitCanonicalPublicPath(value, PUBLIC_MEDIA_ROOTS);
  if (!segments || segments.length < 2) return null;

  const extension = getFileExtension(segments.at(-1) ?? "");
  if (SUPPORTED_IMAGE_EXTENSION_SET.has(extension)) return "image";
  if (SUPPORTED_VIDEO_EXTENSION_SET.has(extension)) return "video";
  return null;
}

export function isSupportedPublicMediaPath(
  value: unknown,
  expectedKind?: MediaAssetKind,
) {
  if (typeof value !== "string") return false;
  const kind = getMediaAssetKind(value);
  return kind !== null && (expectedKind === undefined || kind === expectedKind);
}

export function tryNormalizeImageLibraryDirectory(value: unknown) {
  if (typeof value !== "string") return null;
  const segments = splitCanonicalPublicPath(
    value,
    new Set([IMAGE_LIBRARY_PUBLIC_ROOT.slice(1)]),
  );
  return segments ? `/${segments.join("/")}` : null;
}

export function getImageLibraryRelativeSegments(directory: string) {
  const normalized = tryNormalizeImageLibraryDirectory(directory);
  if (!normalized) return null;
  if (normalized === IMAGE_LIBRARY_PUBLIC_ROOT) return [];
  return normalized.slice(`${IMAGE_LIBRARY_PUBLIC_ROOT}/`.length).split("/");
}

export function joinImageLibraryPath(directory: string, name: string) {
  const normalizedDirectory = tryNormalizeImageLibraryDirectory(directory);
  if (!normalizedDirectory || !isSafePublicPathSegment(name)) return null;
  return `${normalizedDirectory}/${name}`;
}

export function getImageLibraryParentDirectory(directory: string) {
  const segments = getImageLibraryRelativeSegments(directory);
  if (!segments || segments.length === 0) return null;
  if (segments.length === 1) return IMAGE_LIBRARY_PUBLIC_ROOT;
  return `${IMAGE_LIBRARY_PUBLIC_ROOT}/${segments.slice(0, -1).join("/")}`;
}

export function getImageLibraryDirectoryForAsset(value: unknown) {
  if (typeof value !== "string" || getMediaAssetKind(value) === null) {
    return IMAGE_LIBRARY_PUBLIC_ROOT;
  }

  const segments = value.slice(1).split("/");
  if (segments[0] !== IMAGE_LIBRARY_PUBLIC_ROOT.slice(1) || segments.length < 2) {
    return IMAGE_LIBRARY_PUBLIC_ROOT;
  }

  const directory = `/${segments.slice(0, -1).join("/")}`;
  return tryNormalizeImageLibraryDirectory(directory) ?? IMAGE_LIBRARY_PUBLIC_ROOT;
}
