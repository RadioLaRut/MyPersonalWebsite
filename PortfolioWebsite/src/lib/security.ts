import { timingSafeEqual } from "node:crypto";

import { notFound } from "next/navigation.js";
import { NextResponse } from "next/server.js";

import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
} from "./local-editor-access.ts";
import { isTestingMode } from "./site-mode.ts";

type EditorAccessType = "page" | "api";

type EditorAccessOptions = {
  requireToken?: boolean;
};

const PRODUCTION_ENV_BLOCKLIST = [
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_GIT_PROVIDER",
  "VERCEL_GIT_COMMIT_SHA",
  "CI",
] as const;

const UNAUTHORIZED_BODY = {
  error: {
    code: "UNAUTHORIZED",
    message: "Editor access denied",
  },
} as const;

const TOKEN_REQUIRED_BODY = {
  error: {
    code: "EDITOR_TOKEN_REQUIRED",
    message: `Set ${LOCAL_EDITOR_ACCESS_TOKEN_ENV} and send ${LOCAL_EDITOR_ACCESS_HEADER}`,
  },
} as const;

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

function hasBlockedRuntimeEnv(): boolean {
  return PRODUCTION_ENV_BLOCKLIST.some((envName) => process.env[envName] !== undefined);
}

function canAccessLocalEditor(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    isTestingMode() &&
    !hasBlockedRuntimeEnv()
  );
}

function getConfiguredLocalEditorToken() {
  const token = process.env[LOCAL_EDITOR_ACCESS_TOKEN_ENV]?.trim();
  return token ? token : null;
}

function hasMatchingLocalEditorToken(request: Request | undefined, expectedToken: string) {
  const actualToken = request?.headers.get(LOCAL_EDITOR_ACCESS_HEADER)?.trim();
  if (!actualToken) {
    return false;
  }

  const expected = Buffer.from(expectedToken);
  const actual = Buffer.from(actualToken);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function unauthorizedResponse(body: typeof UNAUTHORIZED_BODY | typeof TOKEN_REQUIRED_BODY = UNAUTHORIZED_BODY) {
  return NextResponse.json(body, {
    headers: NO_STORE_HEADER,
    status: 403,
  });
}

export function assertLocalEditorAccess(
  type: EditorAccessType,
  request?: Request,
  options: EditorAccessOptions = {},
): NextResponse | void {
  if (canAccessLocalEditor()) {
    if (!options.requireToken) {
      return;
    }

    const expectedToken = getConfiguredLocalEditorToken();
    if (
      expectedToken &&
      hasMatchingLocalEditorToken(request, expectedToken)
    ) {
      return;
    }

    return unauthorizedResponse(TOKEN_REQUIRED_BODY);
  }

  if (type === "page") {
    notFound();
  }

  return unauthorizedResponse();
}
