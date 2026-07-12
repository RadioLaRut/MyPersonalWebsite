import { toAdminPathFromPublicPath, tryNormalizePublicPath } from "./public-paths.ts";

const SAFE_EXTERNAL_HREF_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const HREF_CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function toSafePuckHref(href: string | undefined): string | undefined {
  if (!href || HREF_CONTROL_CHARACTER_PATTERN.test(href)) {
    return undefined;
  }

  const trimmed = href.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("/")) {
    return tryNormalizePublicPath(trimmed) ?? undefined;
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    return SAFE_EXTERNAL_HREF_PROTOCOLS.has(parsed.protocol) ? trimmed : undefined;
  } catch {
    return undefined;
  }
}

export function toEditorAwareHref(href: string | undefined, editMode?: boolean): string | undefined {
  const safeHref = toSafePuckHref(href);
  if (!safeHref || !safeHref.startsWith("/")) {
    return safeHref;
  }

  if (editMode) {
    return toAdminPathFromPublicPath(safeHref);
  }

  return safeHref;
}
