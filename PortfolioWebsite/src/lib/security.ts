import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
} from "./local-editor-access.ts";
import {
  evaluateLocalEditorAccess,
  type LocalEditorAccessOptions,
} from "./local-editor-policy.ts";

type EditorAccessType = "page" | "api";

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

export function assertLocalEditorAccess(
  type: EditorAccessType,
  request?: Request,
  options: LocalEditorAccessOptions = {},
): NextResponse | void {
  const decision = evaluateLocalEditorAccess(request, options);
  if (decision === "allowed") return;

  if (type === "page") notFound();
  return unauthorizedResponse(
    decision === "token-required" ? TOKEN_REQUIRED_BODY : UNAUTHORIZED_BODY,
  );
}
