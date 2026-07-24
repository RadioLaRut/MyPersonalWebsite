import { CONTENT_BUDGET_PROFILE_V1 } from "../../src/lib/content-budget.ts";

export const SAFE_SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const WINDOWS_RESERVED_FILE_NAME_PATTERN = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;
export const SLUG_LIMITS = CONTENT_BUDGET_PROFILE_V1.slug;

export function getCanonicalSlugSegmentIssue(segment) {
  const normalized = segment.trim().toLowerCase();

  if (!normalized) {
    return "must not be empty";
  }

  if (normalized === "." || normalized === "..") {
    return 'must not be "." or ".."';
  }

  if (normalized.length > SLUG_LIMITS.maxSegmentLength) {
    return `must not exceed ${SLUG_LIMITS.maxSegmentLength} characters`;
  }

  if (!SAFE_SLUG_SEGMENT_PATTERN.test(normalized)) {
    return "must use lowercase letters, numbers, and hyphens only";
  }

  if (WINDOWS_RESERVED_FILE_NAME_PATTERN.test(normalized)) {
    return "must not use a Windows reserved file name";
  }

  if (normalized !== segment) {
    return "must already use canonical lowercase slug casing";
  }

  return null;
}

export function trySafeNormalizeSlugSegment(segment) {
  if (!segment) {
    return null;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return null;
  }

  if (decoded.includes("/") || decoded.includes("\\")) {
    return null;
  }

  const normalized = decoded.trim().toLowerCase();
  return getCanonicalSlugSegmentIssue(normalized) === null ? normalized : null;
}
