import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  type JsonValue,
  listPageSlugs,
  readPageDataByNormalizedSlug,
  writePageDataByNormalizedSlug,
} from "@/lib/puck-content";
import { normalizePuckSlugInput, SlugValidationError } from "@/lib/puck-slug";
import { assertLocalEditorAccess } from "@/lib/security";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

const INTERNAL_ERROR = {
  error: {
    code: "INTERNAL_ERROR",
    message: "Unexpected server error",
  },
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

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) {
    return true;
  }

  const valueType = typeof value;
  if (valueType === "string" || valueType === "number" || valueType === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (!isPlainRecord(value)) {
    return false;
  }

  return Object.values(value).every(isJsonValue);
}

function normalizeSlugOrError(rawSlug: string | null) {
  try {
    return normalizePuckSlugInput(rawSlug ?? "");
  } catch (error) {
    if (error instanceof SlugValidationError) {
      return errorResponse(error.status, error.code, error.message);
    }

    throw error;
  }
}

export async function GET(request: NextRequest) {
  const denied = assertLocalEditorAccess("api");
  if (denied) {
    return denied;
  }

  try {
    if (request.nextUrl.searchParams.get("list") === "1") {
      const slugs = await listPageSlugs();
      return jsonResponse({ slugs });
    }

    const normalizedOrError = normalizeSlugOrError(request.nextUrl.searchParams.get("slug"));
    if (normalizedOrError instanceof NextResponse) {
      return normalizedOrError;
    }

    const data = await readPageDataByNormalizedSlug(normalizedOrError);
    return jsonResponse({
      data,
      slug: normalizedOrError.slugKey,
    });
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      return errorResponse(404, "NOT_FOUND", "Puck page data does not exist");
    }

    if (error instanceof SyntaxError) {
      return errorResponse(500, "INVALID_JSON", "Stored Puck JSON is invalid");
    }

    return jsonResponse(INTERNAL_ERROR, 500);
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

  if (!isPlainRecord(payload)) {
    return errorResponse(400, "BAD_REQUEST", "Request body must be an object");
  }

  const slugValue = "slug" in payload ? payload.slug : null;
  if (slugValue !== null && typeof slugValue !== "string") {
    return errorResponse(400, "BAD_REQUEST", "Request body.slug must be a string");
  }

  const dataValue = "data" in payload ? payload.data : undefined;

  if (!isPlainRecord(dataValue)) {
    return errorResponse(400, "BAD_REQUEST", "Request body.data must be an object");
  }

  if (!isJsonValue(dataValue)) {
    return errorResponse(400, "BAD_REQUEST", "Request body.data must be JSON-serializable");
  }

  const normalizedOrError = normalizeSlugOrError(slugValue ?? "");
  if (normalizedOrError instanceof NextResponse) {
    return normalizedOrError;
  }

  try {
    await writePageDataByNormalizedSlug(normalizedOrError, dataValue);
  } catch {
    return jsonResponse(INTERNAL_ERROR, 500);
  }

  return jsonResponse({
    ok: true,
    path: normalizedOrError.relativeJsonPath,
    slug: normalizedOrError.slugKey,
  });
}
