import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
  LOCAL_EDITOR_ACCESS_TOKENS_ENV,
} from "./local-editor-access.ts";
import {
  evaluateLocalEditorApiAccess,
  type LocalEditorAccessDecision,
} from "./local-editor-policy.ts";

export type LocalEditorRoutePermission = "read" | "write";

const NO_STORE_HEADER = { "Cache-Control": "no-store" } as const;
const UNAUTHORIZED_BODY = {
  error: { code: "UNAUTHORIZED", message: "Editor access denied" },
} as const;
const TOKEN_REQUIRED_BODY = {
  error: {
    code: "EDITOR_TOKEN_REQUIRED",
    message: `Set ${LOCAL_EDITOR_ACCESS_TOKENS_ENV} (or legacy ${LOCAL_EDITOR_ACCESS_TOKEN_ENV}) and send ${LOCAL_EDITOR_ACCESS_HEADER}`,
  },
} as const;

function deniedResponse(decision: Exclude<LocalEditorAccessDecision, "allowed">) {
  return Response.json(
    decision === "token-required" ? TOKEN_REQUIRED_BODY : UNAUTHORIZED_BODY,
    { headers: NO_STORE_HEADER, status: 403 },
  );
}

export const LocalEditorRoutePolicy = {
  evaluateApi(
    request: Request,
    permission: LocalEditorRoutePermission,
  ): LocalEditorAccessDecision {
    return evaluateLocalEditorApiAccess(request, {
      requireToken: permission === "write",
    });
  },

  authorizeApi(
    request: Request,
    permission: LocalEditorRoutePermission,
  ): Response | void {
    const decision = this.evaluateApi(request, permission);
    return decision === "allowed" ? undefined : deniedResponse(decision);
  },
} as const;
