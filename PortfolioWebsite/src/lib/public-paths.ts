export const CANONICAL_PLACEHOLDER_PATH = "/assets/images/placeholder.svg";

const LEGACY_PLACEHOLDER_PATHS = new Set([
  "/assets/images/placeholder-16-9.jpg",
  "/assets/images/placeholder-21-9.jpg",
]);

const LEGACY_WORK_SLUG_ALIASES = {
  "im-explod-with-u": "im-explode",
  "penguin-trading-company": "penguin",
  "pcg-town": "houdini-pcg",
} as const;

export function normalizeLegacyPublicPath(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed) return "/";

  let normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  normalized = normalized.replace(/\/+/g, "/");

  if (normalized === "/p" || normalized === "/p/") return "/";
  if (normalized.startsWith("/p/")) normalized = normalized.slice(2);
  if (normalized.length > 1 && normalized.endsWith("/")) normalized = normalized.slice(0, -1);

  return normalized || "/";
}

export function toCanonicalWorkSlug(slug: string): string {
  return LEGACY_WORK_SLUG_ALIASES[slug as keyof typeof LEGACY_WORK_SLUG_ALIASES] ?? slug;
}

export function isLegacyWorkSlug(slug: string): boolean {
  return slug in LEGACY_WORK_SLUG_ALIASES;
}

export function toPublicPathFromSlugKey(slugKey: string): string {
  return slugKey === "index" ? "/" : `/${slugKey}`;
}

export function toAdminPathFromSlugKey(slugKey: string): string {
  const publicPath = toPublicPathFromSlugKey(slugKey);
  return publicPath === "/" ? "/admin" : `/admin${publicPath}`;
}

export function toAdminPathFromPublicPath(pathname: string): string {
  const normalized = normalizeLegacyPublicPath(pathname);
  if (normalized === "/admin" || normalized.startsWith("/admin/")) {
    return normalized;
  }
  return normalized === "/" ? "/admin" : `/admin${normalized}`;
}

export function normalizeImageSrc(src: string | null | undefined): string {
  const trimmed = src?.trim();
  if (!trimmed) return CANONICAL_PLACEHOLDER_PATH;
  if (/placeholder\.png$/i.test(trimmed) || LEGACY_PLACEHOLDER_PATHS.has(trimmed)) {
    return CANONICAL_PLACEHOLDER_PATH;
  }

  const isValidPath = trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed);
  return isValidPath ? trimmed : CANONICAL_PLACEHOLDER_PATH;
}

export function isPlaceholderImageSrc(src: string | null | undefined): boolean {
  return normalizeImageSrc(src) === CANONICAL_PLACEHOLDER_PATH;
}
