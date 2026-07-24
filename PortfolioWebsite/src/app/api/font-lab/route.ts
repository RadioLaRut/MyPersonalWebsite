import path from "node:path";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  FONT_LAB_CONFIG_FILE,
  hasFontLabConfig,
  mergeFontLabPresetConfig,
  readFontLabConfig,
  writeFontLabConfig,
} from "@/lib/font-lab-config";
import { parseFontLabSavePayload } from "@/lib/font-lab-config-schema";
import { CONTENT_BUDGET_PROFILE_V1 } from "@/lib/content-budget";
import {
  readJsonWithLimit,
  RequestBodyError,
} from "@/lib/request-body-policy";
import { assertLocalEditorApiAccess } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    headers: NO_STORE_HEADER,
    status,
  });
}

function errorResponse(status: number, code: string, message: string) {
  return jsonResponse(
    {
      error: {
        code,
        message,
      },
    },
    status,
  );
}

export async function GET(request: NextRequest) {
  const denied = assertLocalEditorApiAccess(request);
  if (denied) {
    return denied;
  }

  try {
    const hasSaved = await hasFontLabConfig();
    const config = await readFontLabConfig();

    return jsonResponse({
      config,
      hasSaved,
      path: path.relative(process.cwd(), FONT_LAB_CONFIG_FILE).replaceAll(path.sep, "/"),
    });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Failed to load Font Lab config");
  }
}

export async function POST(request: NextRequest) {
  const denied = assertLocalEditorApiAccess(request, { requireToken: true });
  if (denied) {
    return denied;
  }

  let payload: unknown;
  try {
    payload = await readJsonWithLimit(
      request,
      CONTENT_BUDGET_PROFILE_V1.requestBytes.fontLabJson,
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return errorResponse(error.status, error.code, error.message);
    }
    return errorResponse(400, "BAD_REQUEST", "Request body must be valid JSON");
  }

  const rawConfig =
    payload && typeof payload === "object" ? payload : undefined;

  const savePayload = parseFontLabSavePayload(rawConfig);
  if (!savePayload) {
    return errorResponse(400, "BAD_REQUEST", "Request body is invalid");
  }

  try {
    const currentDocument = await readFontLabConfig();
    const nextDocument = mergeFontLabPresetConfig(currentDocument, savePayload);
    await writeFontLabConfig(nextDocument);
    return jsonResponse({
      config: nextDocument,
      ok: true,
      path: path.relative(process.cwd(), FONT_LAB_CONFIG_FILE).replaceAll(path.sep, "/"),
    });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Failed to save Font Lab config");
  }
}
