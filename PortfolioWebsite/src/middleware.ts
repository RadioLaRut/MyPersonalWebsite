import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

const isCmsPreviewEnabled =
  process.env.NEXT_PUBLIC_ENABLE_PUCK === "true" || process.env.NEXT_PUBLIC_USE_JSON === "true";

function isInvalidPuckPath(request: NextRequest) {
  const rawUrl = request.url.toLowerCase();
  if (rawUrl.includes("%2e%2e") || rawUrl.includes("\\")) {
    return true;
  }

  const pathname = request.nextUrl.pathname.slice(2);
  if (pathname.includes("\\")) {
    return true;
  }

  try {
    const decoded = decodeURIComponent(pathname);
    return /(^|\/)\.\.?(\/|$)/.test(decoded);
  } catch {
    return true;
  }
}

function toCmsRedirectPath(pathname: string): string | null {
  if (pathname === "/works") {
    return "/p/works";
  }

  if (pathname === "/works/lighting-portfolio") {
    return "/p/works/lighting-portfolio";
  }

  if (pathname.startsWith("/works/lighting-portfolio/")) {
    return "/p/works/lighting-portfolio";
  }

  if (pathname.startsWith("/works/")) {
    return `/p${pathname}`;
  }

  if (pathname === "/contact") {
    return "/p/contact";
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isCmsPreviewEnabled) {
    const redirectPath = toCmsRedirectPath(pathname);
    if (redirectPath && redirectPath !== pathname) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = redirectPath;
      return NextResponse.redirect(redirectUrl, 307);
    }
  }

  if ((pathname === "/p" || pathname.startsWith("/p/")) && isInvalidPuckPath(request)) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/p/:path*", "/works/:path*", "/works", "/contact", "/playground"],
};
