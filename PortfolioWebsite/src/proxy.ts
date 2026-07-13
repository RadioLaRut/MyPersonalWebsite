import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { evaluateProxyPath } from "./lib/proxy-policy.ts";
import { resolveGeneratedWorkAlias } from "./puck/generated/work-alias-targets.ts";

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

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const decision = evaluateProxyPath(pathname, resolveGeneratedWorkAlias);
  if (decision.kind === "bad-request") return createBadRequestResponse();
  if (decision.kind === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = decision.pathname;
    return NextResponse.redirect(redirectUrl, decision.status);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/p", "/p/:path*", "/works/:path*"],
};
