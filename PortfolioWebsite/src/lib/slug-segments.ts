import {
  SAFE_SLUG_SEGMENT_PATTERN,
  WINDOWS_RESERVED_FILE_NAME_PATTERN,
  getCanonicalSlugSegmentIssue as getCanonicalSlugSegmentIssueImpl,
  trySafeNormalizeSlugSegment as trySafeNormalizeSlugSegmentImpl,
} from "../../scripts/lib/slug-segments.mjs";

export {
  SAFE_SLUG_SEGMENT_PATTERN,
  WINDOWS_RESERVED_FILE_NAME_PATTERN,
};

export function getCanonicalSlugSegmentIssue(segment: string): string | null {
  return getCanonicalSlugSegmentIssueImpl(segment);
}

export function trySafeNormalizeSlugSegment(segment: string): string | null {
  return trySafeNormalizeSlugSegmentImpl(segment);
}
