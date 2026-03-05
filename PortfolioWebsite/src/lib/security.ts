import { notFound } from "next/navigation.js";
import { NextResponse } from "next/server.js";

type EditorAccessType = "page" | "api";

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

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

function hasBlockedRuntimeEnv(): boolean {
  return PRODUCTION_ENV_BLOCKLIST.some((envName) => process.env[envName] !== undefined);
}

function canAccessLocalEditor(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_PUCK === "true" &&
    !hasBlockedRuntimeEnv()
  );
}

export function assertLocalEditorAccess(type: EditorAccessType): NextResponse | void {
  if (canAccessLocalEditor()) {
    return;
  }

  if (type === "page") {
    notFound();
  }

  return NextResponse.json(UNAUTHORIZED_BODY, {
    headers: NO_STORE_HEADER,
    status: 403,
  });
}
