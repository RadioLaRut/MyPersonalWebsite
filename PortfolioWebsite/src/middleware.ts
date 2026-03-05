import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

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

export function middleware(request: NextRequest) {
  if (isInvalidPuckPath(request)) {
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
  matcher: ["/p/:path*"],
};
