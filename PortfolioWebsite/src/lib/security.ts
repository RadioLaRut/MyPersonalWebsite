import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  createLocalEditorTransportContext,
  evaluateLocalEditorAccess,
  type LocalEditorAccessOptions,
} from "./local-editor-policy.ts";
import { LocalEditorRoutePolicy } from "./local-editor-route-policy.ts";

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
): Response | void {
  return LocalEditorRoutePolicy.authorizeApi(
    request,
    options.requireToken ? "write" : "read",
  );
}
