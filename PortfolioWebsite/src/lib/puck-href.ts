import { toAdminPathFromPublicPath, tryNormalizePublicPath } from "./public-paths.ts";

const SAFE_EXTERNAL_HREF_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const EXTERNAL_WEB_HREF_PROTOCOLS = new Set(["http:", "https:"]);
const HREF_CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const LOCAL_HREF_ORIGIN = "https://portfolio.local";

function parseSafeLocalHref(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(href, LOCAL_HREF_ORIGIN);
    if (parsed.origin !== LOCAL_HREF_ORIGIN) {
      return null;
    }

    const pathname = tryNormalizePublicPath(parsed.pathname);
    return pathname
      ? { hash: parsed.hash, pathname, search: parsed.search }
      : null;
  } catch {
    return null;
  }
}

export function toSafePuckHref(href: string | undefined): string | undefined {
  if (!href || HREF_CONTROL_CHARACTER_PATTERN.test(href)) {
    return undefined;
  }

  const trimmed = href.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("/")) {
    const localHref = parseSafeLocalHref(trimmed);
    return localHref
      ? `${localHref.pathname}${localHref.search}${localHref.hash}`
      : undefined;
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

export function isExternalWebHref(href: string | undefined): boolean {
  const safeHref = toSafePuckHref(href);
  if (!safeHref || safeHref.startsWith("/") || safeHref.startsWith("#")) {
    return false;
  }

  try {
    return EXTERNAL_WEB_HREF_PROTOCOLS.has(new URL(safeHref).protocol);
  } catch {
    return false;
  }
}

export function toEditorAwareHref(href: string | undefined, editMode?: boolean): string | undefined {
  const safeHref = toSafePuckHref(href);
  if (!safeHref || !safeHref.startsWith("/")) {
    return safeHref;
  }

  if (editMode) {
    const localHref = parseSafeLocalHref(safeHref);
    return localHref
      ? `${toAdminPathFromPublicPath(localHref.pathname)}${localHref.search}${localHref.hash}`
      : undefined;
  }

  return safeHref;
}
