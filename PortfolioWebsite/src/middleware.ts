import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { toCanonicalWorkSlug } from "@/lib/public-paths";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

function isInvalidLegacyPath(pathname: string) {
  const rawUrl = pathname.toLowerCase();
  return rawUrl.includes("%2e%2e") || rawUrl.includes("\\");
}

function decodeSlugSegment(segment: string) {
  try {
    const decoded = decodeURIComponent(segment);
    const normalized = decoded.trim().toLowerCase();

    if (
      !normalized ||
      normalized === "." ||
      normalized === ".." ||
      normalized.includes("/") ||
      normalized.includes("\\") ||
      normalized.includes("\0")
    ) {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}

function normalizeLegacySegments(pathname: string) {
  const rawPath = pathname.replace(/^\/p/i, "");
  const merged = rawPath.replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "");
  if (!merged) {
    return [];
  }

  const segments = merged.split("/");
  const normalizedSegments = segments.map(decodeSlugSegment);
  return normalizedSegments.every(Boolean) ? (normalizedSegments as string[]) : null;
}

function toLegacyRedirectPath(pathname: string) {
  const segments = normalizeLegacySegments(pathname);
  if (segments === null) {
    return null;
  }

  if (segments.length === 0) {
    return "/";
  }

  if (segments[0] === "works" && segments.length === 2) {
    segments[1] = toCanonicalWorkSlug(segments[1]);
  }

  return `/${segments.join("/")}`;
}

function toCanonicalWorkRedirectPath(pathname: string) {
  const match = pathname.match(/^\/works\/([^/]+)$/);
  if (!match) {
    return null;
  }

  const currentSlug = match[1];
  const canonicalSlug = toCanonicalWorkSlug(currentSlug);
  if (canonicalSlug === currentSlug) {
    return null;
  }

  return `/works/${canonicalSlug}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/p" || pathname === "/p/" || pathname.startsWith("/p/")) {
    if (isInvalidLegacyPath(pathname)) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Invalid slug path",
          },
        },
        {
          headers: NO_STORE_HEADER,
          status: 400,
        },
      );
    }

    const redirectPath = toLegacyRedirectPath(pathname);
    if (!redirectPath) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Invalid slug path",
          },
        },
        {
          headers: NO_STORE_HEADER,
          status: 400,
        },
      );
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    return NextResponse.redirect(redirectUrl, 307);
  }

  const workRedirectPath = toCanonicalWorkRedirectPath(pathname);
  if (workRedirectPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = workRedirectPath;
    return NextResponse.redirect(redirectUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/p", "/p/:path*", "/works/:path*"],
};
