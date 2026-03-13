import path from "node:path";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  COMPONENT_DESIGN_CONFIG_FILE,
  hasComponentDesignConfig,
  readComponentDesignConfig,
  writeComponentDesignConfig,
} from "@/lib/component-design-config";
import { parseComponentDesignDocument } from "@/lib/component-design-schema";
import { assertLocalEditorAccess } from "@/lib/security";

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

export async function GET() {
  const denied = assertLocalEditorAccess("api");
  if (denied) {
    return denied;
  }

  try {
    const hasSaved = await hasComponentDesignConfig();
    const config = await readComponentDesignConfig();

    return jsonResponse({
      config,
      hasSaved,
      path: path.relative(process.cwd(), COMPONENT_DESIGN_CONFIG_FILE).replaceAll(path.sep, "/"),
    });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Failed to load component design config");
  }
}

export async function POST(request: NextRequest) {
  const denied = assertLocalEditorAccess("api");
  if (denied) {
    return denied;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "BAD_REQUEST", "Request body must be valid JSON");
  }

  const rawConfig =
    payload && typeof payload === "object" && "config" in payload
      ? (payload as { config?: unknown }).config
      : payload;

  const document = parseComponentDesignDocument(rawConfig);
  if (!document) {
    return errorResponse(400, "BAD_REQUEST", "Request body is invalid");
  }

  try {
    await writeComponentDesignConfig(document);
    return jsonResponse({
      config: document,
      ok: true,
      path: path.relative(process.cwd(), COMPONENT_DESIGN_CONFIG_FILE).replaceAll(path.sep, "/"),
    });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Failed to save component design config");
  }
}
