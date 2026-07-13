import { trySafeNormalizeSlugSegment } from "./slug-segments.ts";

export const CANONICAL_PLACEHOLDER_PATH = "/assets/images/placeholder.svg";

const LEGACY_PLACEHOLDER_PATHS = new Set([
  "/assets/images/placeholder-16-9.jpg",
  "/assets/images/placeholder-21-9.jpg",
]);

export type WorkAliasResolver = (slug: string) => string | null | undefined;

const ADMIN_PATH_PREFIX_PATTERN = /^\/?admin(?:\/|$)/i;
const LEGACY_PUBLIC_PREFIX_PATTERN = /^\/?p(?:\/|$)/i;

function toPublicPathFromSegments(segments: string[]) {
  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

function canonicalizeWorkSegments(
  segments: string[],
  resolveWorkAlias?: WorkAliasResolver,
) {
  if (segments[0] === "works" && segments.length === 2) {
    return ["works", toCanonicalWorkSlug(segments[1], resolveWorkAlias)];
  }

  return segments;
}

export function splitPublicPathSegments(pathname: string): string[] | null {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") {
    return [];
  }

  if (trimmed.includes("\\")) {
    return null;
  }

  const rawPath = (trimmed.startsWith("/") ? trimmed : `/${trimmed}`)
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
  if (!rawPath) {
    return [];
  }

  return rawPath.split("/");
}

function parsePublicPathSegments(pathname: string): string[] | null {
  const segments = splitPublicPathSegments(pathname);
  if (segments === null) {
    return null;
  }

  const decodedSegments = segments.map(trySafeNormalizeSlugSegment);
  if (decodedSegments.some((segment) => segment === null)) {
    return null;
  }

  return decodedSegments as string[];
}

function stripLegacyPublicPrefix(segments: string[]) {
  return segments[0] === "p" ? segments.slice(1) : segments;
}

function stripAdminPathPrefix(pathname: string) {
  const trimmed = pathname.trim();
  const normalizedInput = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (!ADMIN_PATH_PREFIX_PATTERN.test(normalizedInput)) {
    return pathname;
  }

  return normalizedInput.replace(/^\/admin/i, "") || "/";
}

export function tryNormalizePublicPath(
  pathname: string,
  resolveWorkAlias?: WorkAliasResolver,
): string | null {
  const parsedSegments = parsePublicPathSegments(pathname);
  if (parsedSegments === null) {
    return null;
  }

  const segments = stripLegacyPublicPrefix(parsedSegments);
  if (segments[0] === "admin") {
    return null;
  }

  return toPublicPathFromSegments(canonicalizeWorkSegments(segments, resolveWorkAlias));
}

export function tryNormalizeLegacyPublicRedirectPath(
  pathname: string,
  resolveWorkAlias?: WorkAliasResolver,
): string | null {
  const trimmed = pathname.trim();
  const normalizedInput = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (!LEGACY_PUBLIC_PREFIX_PATTERN.test(normalizedInput)) {
    return null;
  }

  return tryNormalizePublicPath(normalizedInput, resolveWorkAlias);
}

export type PublicPathAnalysis =
  | { kind: "bad" }
  | { canonical: string; kind: "ok"; segments: string[] }
  | { kind: "redirect"; to: string };

export function analyzePublicPath(
  pathname: string,
  resolveWorkAlias?: WorkAliasResolver,
): PublicPathAnalysis {
  const parsedSegments = parsePublicPathSegments(pathname);
  if (parsedSegments === null) {
    return { kind: "bad" };
  }

  const segments = stripLegacyPublicPrefix(parsedSegments);
  if (segments[0] === "admin") {
    return { kind: "bad" };
  }

  const canonicalSegments = canonicalizeWorkSegments(segments, resolveWorkAlias);
  const canonical = toPublicPathFromSegments(canonicalSegments);

  if (
    segments[0] === "works" &&
    segments.length === 2 &&
    canonicalSegments[1] !== segments[1]
  ) {
    return { kind: "redirect", to: canonical };
  }

  return { canonical, kind: "ok", segments: canonicalSegments };
}

export function normalizeEditorPathInputToSlugKey(rawValue: string): string | null {
  const normalizedPath = tryNormalizePublicPath(stripAdminPathPrefix(rawValue));
  if (normalizedPath === null) {
    return null;
  }

  return normalizedPath === "/" ? "index" : normalizedPath.replace(/^\//, "");
}

export function normalizeLegacyPublicPath(pathname: string | null | undefined): string {
  // 兼容旧调用方的安全出口：非法或空输入只能回到首页，不能抛到渲染链路。
  return tryNormalizePublicPath(pathname ?? "") ?? "/";
}

export function toCanonicalWorkSlug(
  slug: string,
  resolveWorkAlias?: WorkAliasResolver,
): string {
  return resolveWorkAlias?.(slug) ?? slug;
}

export function isLegacyWorkSlug(
  slug: string,
  resolveWorkAlias?: WorkAliasResolver,
): boolean {
  return Boolean(resolveWorkAlias?.(slug));
}

export function toPublicPathFromSlugKey(slugKey: string): string {
  return slugKey === "index" ? "/" : `/${slugKey}`;
}

export function toAdminPathFromSlugKey(slugKey: string): string {
  const publicPath = toPublicPathFromSlugKey(slugKey);
  return publicPath === "/" ? "/admin" : `/admin${publicPath}`;
}

export function toAdminPathFromPublicPath(pathname: string): string {
  const normalized = normalizeLegacyPublicPath(stripAdminPathPrefix(pathname));
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
