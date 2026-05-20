import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";

import {
  analyzePublicPath,
  tryNormalizeLegacyPublicRedirectPath,
} from "./lib/public-paths.ts";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

const BAD_REQUEST_RESPONSE = {
  error: {
    code: "BAD_REQUEST",
    message: "Invalid slug path",
  },
};

function createBadRequestResponse() {
  return NextResponse.json(BAD_REQUEST_RESPONSE, {
    headers: NO_STORE_HEADER,
    status: 400,
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/p" || pathname === "/p/" || pathname.startsWith("/p/")) {
    const redirectPath = tryNormalizeLegacyPublicRedirectPath(pathname);
    if (!redirectPath) {
      return createBadRequestResponse();
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    return NextResponse.redirect(redirectUrl, 307);
  }

  if (pathname === "/works" || pathname.startsWith("/works/")) {
    const result = analyzePublicPath(pathname);
    if (result.kind === "bad") {
      return createBadRequestResponse();
    }

    if (result.kind === "redirect") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = result.to;
      return NextResponse.redirect(redirectUrl, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/p", "/p/:path*", "/works/:path*"],
};
