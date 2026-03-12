import path from "node:path";

export const CONTENT_PAGES_ROOT = path.resolve(process.cwd(), "content/pages");

const ENCODED_TRAVERSAL_PATTERN = /%2e%2e/i;
const SAFE_SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WINDOWS_RESERVED_FILE_NAME_PATTERN = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;

export class SlugValidationError extends Error {
  readonly code = "BAD_REQUEST";
  readonly status = 400;
}

export type NormalizedPuckSlug = {
  absoluteJsonPath: string;
  relativeJsonPath: string;
  slugKey: string;
  slugSegments: string[];
};

function makeSlugValidationError(message: string): SlugValidationError {
  return new SlugValidationError(message);
}

function assertWithinContentRoot(candidatePath: string) {
  const normalizedRoot = `${CONTENT_PAGES_ROOT}${path.sep}`;
  if (candidatePath !== CONTENT_PAGES_ROOT && !candidatePath.startsWith(normalizedRoot)) {
    throw makeSlugValidationError("Slug resolves outside content/pages");
  }
}

function normalizeRawStringInput(rawInput: string): string[] {
  const raw = rawInput.trim();
  if (raw.length === 0) {
    return [];
  }

  if (raw.includes("\\")) {
    throw makeSlugValidationError("Backslashes are not allowed in slug");
  }

  if (ENCODED_TRAVERSAL_PATTERN.test(raw)) {
    throw makeSlugValidationError("Encoded traversal patterns are not allowed");
  }

  let withoutPrefix = raw;
  if (/^\/?p(?:\/|$)/i.test(withoutPrefix)) {
    withoutPrefix = withoutPrefix.replace(/^\/?p/i, "");
  }

  const mergedSlashPath = withoutPrefix.replace(/\/+/g, "/");
  const trimmedPath = mergedSlashPath.replace(/^\/+|\/+$/g, "");
  if (!trimmedPath) {
    return [];
  }

  return trimmedPath.split("/");
}

function validateNormalizedSlugSegment(normalized: string) {
  if (!normalized) {
    throw makeSlugValidationError("Empty slug segment is not allowed");
  }

  if (normalized === "." || normalized === "..") {
    throw makeSlugValidationError("Slug segment is invalid");
  }

  if (normalized.includes("\0")) {
    throw makeSlugValidationError("Slug segment contains null byte");
  }

  if (!SAFE_SLUG_SEGMENT_PATTERN.test(normalized)) {
    throw makeSlugValidationError("Slug segment must use lowercase letters, numbers, and hyphens only");
  }

  if (WINDOWS_RESERVED_FILE_NAME_PATTERN.test(normalized)) {
    throw makeSlugValidationError("Slug segment uses a reserved file name");
  }
}

export function normalizePuckSlugSegment(rawSegment: string): string {
  if (!rawSegment) {
    throw makeSlugValidationError("Empty slug segment is not allowed");
  }

  if (rawSegment.includes("/") || rawSegment.includes("\\")) {
    throw makeSlugValidationError("Slug segment contains path separator");
  }

  const normalized = rawSegment.trim().toLowerCase();
  validateNormalizedSlugSegment(normalized);
  return normalized;
}

function decodeAndNormalizeSegment(segment: string): string {
  if (!segment) {
    throw makeSlugValidationError("Empty slug segment is not allowed");
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    throw makeSlugValidationError("Slug contains invalid URI encoding");
  }

  if (decoded.includes("/") || decoded.includes("\\")) {
    throw makeSlugValidationError("Slug segment contains path separator");
  }

  return normalizePuckSlugSegment(decoded);
}

export function normalizePuckSlugInput(rawInput: string | string[] | undefined): NormalizedPuckSlug {
  const segments = Array.isArray(rawInput)
    ? rawInput.filter((segment) => segment.length > 0)
    : normalizeRawStringInput(rawInput ?? "");

  const slugSegments = segments.map(decodeAndNormalizeSegment);
  const slugKey = slugSegments.length === 0 ? "index" : slugSegments.join("/");
  const relativeJsonPath = `${slugKey}.json`;
  const absoluteJsonPath = path.resolve(CONTENT_PAGES_ROOT, relativeJsonPath);

  assertWithinContentRoot(absoluteJsonPath);

  return {
    absoluteJsonPath,
    relativeJsonPath,
    slugKey,
    slugSegments,
  };
}

export function toPuckRouteSegments(slugKey: string): string[] {
  if (slugKey === "index") {
    return [];
  }

  return slugKey.split("/");
}
