import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
} from "./local-editor-access.ts";
import {
  createLocalEditorTransportContext,
  evaluateLocalEditorAccess,
  evaluateLocalEditorApiAccess,
  type LocalEditorAccessOptions,
} from "./local-editor-policy.ts";

const UNAUTHORIZED_BODY = {
  error: { code: "UNAUTHORIZED", message: "Editor access denied" },
} as const;

const TOKEN_REQUIRED_BODY = {
  error: {
    code: "EDITOR_TOKEN_REQUIRED",
    message: `Set ${LOCAL_EDITOR_ACCESS_TOKEN_ENV} and send ${LOCAL_EDITOR_ACCESS_HEADER}`,
  },
} as const;

function unauthorizedResponse(body: typeof UNAUTHORIZED_BODY | typeof TOKEN_REQUIRED_BODY) {
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
    status: 403,
  });
}

function apiAccessResponse(decision: ReturnType<typeof evaluateLocalEditorApiAccess>) {
  if (decision === "allowed") return;
  return unauthorizedResponse(
    decision === "token-required" ? TOKEN_REQUIRED_BODY : UNAUTHORIZED_BODY,
  );
}

export async function assertLocalEditorPageAccess(): Promise<void> {
  const requestHeaders = await headers();
  const context = createLocalEditorTransportContext(
    requestHeaders.get("host"),
    requestHeaders.get("origin"),
  );

  if (evaluateLocalEditorAccess(context) !== "allowed") {
    notFound();
  }
}

export function assertLocalEditorApiAccess(
  request: Request,
  options: LocalEditorAccessOptions = {},
): NextResponse | void {
  return apiAccessResponse(evaluateLocalEditorApiAccess(request, options));
}
