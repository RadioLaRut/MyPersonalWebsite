import { timingSafeEqual } from "node:crypto";

import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
} from "./local-editor-access.ts";
import { isTestingMode } from "./site-mode.ts";

export type LocalEditorAccessDecision = "allowed" | "token-required" | "unauthorized";

export type LocalEditorAccessOptions = {
  requireToken?: boolean;
};

export const PRODUCTION_ENV_BLOCKLIST = [
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_GIT_PROVIDER",
  "VERCEL_GIT_COMMIT_SHA",
  "CI",
] as const;

function hasBlockedRuntimeEnv(): boolean {
  return PRODUCTION_ENV_BLOCKLIST.some((envName) => process.env[envName] !== undefined);
}

function canAccessLocalEditor(): boolean {
  return process.env.NODE_ENV === "development" && isTestingMode() && !hasBlockedRuntimeEnv();
}

function hasMatchingLocalEditorToken(request: Request | undefined, expectedToken: string) {
  const actualToken = request?.headers.get(LOCAL_EDITOR_ACCESS_HEADER)?.trim();
  if (!actualToken) return false;

  const expected = Buffer.from(expectedToken);
  const actual = Buffer.from(actualToken);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function evaluateLocalEditorAccess(
  request?: Request,
  options: LocalEditorAccessOptions = {},
): LocalEditorAccessDecision {
  if (!canAccessLocalEditor()) return "unauthorized";
  if (!options.requireToken) return "allowed";

  const expectedToken = process.env[LOCAL_EDITOR_ACCESS_TOKEN_ENV]?.trim();
  return expectedToken && hasMatchingLocalEditorToken(request, expectedToken)
    ? "allowed"
    : "token-required";
}
