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

export type LocalEditorTransportContext = {
  authority: string;
  origin?: string;
};

type LoopbackAuthority = {
  hostname: "127.0.0.1" | "localhost" | "[::1]";
  port?: number;
};

export const PRODUCTION_ENV_BLOCKLIST = [
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_GIT_PROVIDER",
  "VERCEL_GIT_COMMIT_SHA",
  "CI",
] as const;

const LOOPBACK_AUTHORITY_PATTERN =
  /^(127\.0\.0\.1|localhost|\[::1\])(?::([0-9]{1,5}))?$/iu;

function hasBlockedRuntimeEnv(): boolean {
  return PRODUCTION_ENV_BLOCKLIST.some((envName) => process.env[envName] !== undefined);
}

function canAccessLocalEditor(): boolean {
  return process.env.NODE_ENV === "development" && isTestingMode() && !hasBlockedRuntimeEnv();
}

function parseLoopbackAuthority(rawAuthority: string): LoopbackAuthority | null {
  if (
    rawAuthority.length === 0 ||
    rawAuthority !== rawAuthority.trim() ||
    rawAuthority.includes(",") ||
    rawAuthority.includes("@") ||
    /[\\/?#]/u.test(rawAuthority)
  ) {
    return null;
  }

  const match = LOOPBACK_AUTHORITY_PATTERN.exec(rawAuthority);
  if (!match) return null;

  const hostname = match[1].toLowerCase() as LoopbackAuthority["hostname"];
  const port = match[2] === undefined ? undefined : Number(match[2]);
  if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65_535)) {
    return null;
  }

  return { hostname, ...(port === undefined ? {} : { port }) };
}

function formatLoopbackAuthority(authority: LoopbackAuthority): string {
  return authority.port === undefined
    ? authority.hostname
    : `${authority.hostname}:${authority.port}`;
}

function defaultPortForProtocol(protocol: string): number | undefined {
  if (protocol === "http:") return 80;
  if (protocol === "https:") return 443;
  return undefined;
}

function authoritiesMatch(
  left: LoopbackAuthority,
  right: LoopbackAuthority,
  protocol?: string,
): boolean {
  if (left.hostname !== right.hostname) return false;
  if (!protocol) return left.port === right.port;

  const defaultPort = defaultPortForProtocol(protocol);
  return (left.port ?? defaultPort) === (right.port ?? defaultPort);
}

function parseOrigin(rawOrigin: string) {
  if (rawOrigin.length === 0 || rawOrigin !== rawOrigin.trim() || rawOrigin.includes(",")) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawOrigin);
  } catch {
    return null;
  }

  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    parsed.username.length > 0 ||
    parsed.password.length > 0 ||
    parsed.pathname !== "/" ||
    parsed.search.length > 0 ||
    parsed.hash.length > 0 ||
    parsed.origin !== rawOrigin
  ) {
    return null;
  }

  const authority = parseLoopbackAuthority(parsed.host);
  return authority ? { authority, parsed } : null;
}

export function createLocalEditorTransportContext(
  rawAuthority: string | null,
  rawOrigin?: string | null,
): LocalEditorTransportContext | null {
  if (!rawAuthority) return null;

  const authority = parseLoopbackAuthority(rawAuthority);
  if (!authority) return null;

  if (!rawOrigin) {
    return { authority: formatLoopbackAuthority(authority) };
  }

  const origin = parseOrigin(rawOrigin);
  if (!origin || !authoritiesMatch(authority, origin.authority)) return null;

  return {
    authority: formatLoopbackAuthority(authority),
    origin: origin.parsed.origin,
  };
}

export function createApiLocalEditorTransportContext(
  request: Request,
): LocalEditorTransportContext | null {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return null;
  }

  if (
    (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") ||
    requestUrl.username.length > 0 ||
    requestUrl.password.length > 0
  ) {
    return null;
  }

  const requestAuthority = parseLoopbackAuthority(requestUrl.host);
  if (!requestAuthority) return null;

  const hostHeader = request.headers.get("host");
  if (hostHeader !== null) {
    const headerAuthority = parseLoopbackAuthority(hostHeader);
    if (
      !headerAuthority ||
      !authoritiesMatch(requestAuthority, headerAuthority, requestUrl.protocol)
    ) {
      return null;
    }
  }

  const rawOrigin = request.headers.get("origin");
  if (rawOrigin !== null) {
    const origin = parseOrigin(rawOrigin);
    if (
      !origin ||
      origin.parsed.protocol !== requestUrl.protocol ||
      origin.parsed.origin !== requestUrl.origin
    ) {
      return null;
    }
  }

  return {
    authority: formatLoopbackAuthority(requestAuthority),
    ...(rawOrigin === null ? {} : { origin: rawOrigin }),
  };
}

function hasMatchingLocalEditorToken(actualToken: string | null, expectedToken: string) {
  const normalizedActualToken = actualToken?.trim();
  if (!normalizedActualToken) return false;

  const expected = Buffer.from(expectedToken);
  const actual = Buffer.from(normalizedActualToken);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function evaluateLocalEditorAccess(
  context: LocalEditorTransportContext | null,
  actualToken: string | null = null,
  options: LocalEditorAccessOptions = {},
): LocalEditorAccessDecision {
  if (!canAccessLocalEditor() || context === null) return "unauthorized";
  if (!options.requireToken) return "allowed";

  const expectedToken = process.env[LOCAL_EDITOR_ACCESS_TOKEN_ENV]?.trim();
  return expectedToken && hasMatchingLocalEditorToken(actualToken, expectedToken)
    ? "allowed"
    : "token-required";
}

export function evaluateLocalEditorApiAccess(
  request: Request,
  options: LocalEditorAccessOptions = {},
): LocalEditorAccessDecision {
  const context = createApiLocalEditorTransportContext(request);
  return evaluateLocalEditorAccess(
    context,
    request.headers.get(LOCAL_EDITOR_ACCESS_HEADER),
    options,
  );
}
