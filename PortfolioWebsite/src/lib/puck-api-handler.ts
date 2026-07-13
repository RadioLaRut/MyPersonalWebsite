import type { ContentRepository } from "./content-repository.ts";
import {
  ContentNotFoundError,
  ContentPersistenceError,
  StoredContentInvalidError,
} from "./content-repository.ts";
import { isJsonValue, isPlainRecord } from "./json-utils.ts";
import {
  LOCAL_EDITOR_ACCESS_HEADER,
  LOCAL_EDITOR_ACCESS_TOKEN_ENV,
} from "./local-editor-access.ts";
import { evaluateLocalEditorAccess } from "./local-editor-policy.ts";
import { PageDocumentValidationError } from "./page-document-contract.ts";
import { synchronizeNextProjectBlocks } from "./project-catalog.ts";
import { normalizePuckSlugInput, SlugValidationError } from "./puck-slug.ts";

type PuckApiRepository = Pick<
  ContentRepository,
  "listPages" | "publishPage" | "readPage" | "readProjectCatalog"
>;

const NO_STORE_HEADER = { "Cache-Control": "no-store" } as const;

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { headers: NO_STORE_HEADER, status });
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  issues?: PageDocumentValidationError["issues"],
) {
  return jsonResponse({
    error: {
      code,
      ...(issues ? { issues } : {}),
      message,
    },
  }, status);
}

function authorize(request: Request, requireToken = false) {
  const decision = evaluateLocalEditorAccess(request, { requireToken });
  if (decision === "allowed") return null;

  return decision === "token-required"
    ? errorResponse(
      403,
      "EDITOR_TOKEN_REQUIRED",
      `Set ${LOCAL_EDITOR_ACCESS_TOKEN_ENV} and send ${LOCAL_EDITOR_ACCESS_HEADER}`,
    )
    : errorResponse(403, "UNAUTHORIZED", "Editor access denied");
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

export async function handlePuckGet(
  request: Request,
  repository: PuckApiRepository,
) {
  const denied = authorize(request);
  if (denied) return denied;

  try {
    const searchParams = new URL(request.url).searchParams;
    if (searchParams.get("list") === "1") {
      const slugs = (await repository.listPages()).map((page) => page.slug);
      return jsonResponse({ slugs });
    }

    const normalizedOrError = normalizeSlugOrError(searchParams.get("slug"));
    if (normalizedOrError instanceof Response) return normalizedOrError;

    const storedData = await repository.readPage(normalizedOrError.slugSegments);
    const currentProjectId =
      normalizedOrError.slugSegments.length === 2 &&
      normalizedOrError.slugSegments[0] === "works"
        ? normalizedOrError.slugSegments[1]
        : null;
    const data = currentProjectId
      ? synchronizeNextProjectBlocks(
        storedData,
        currentProjectId,
        await repository.readProjectCatalog(),
      )
      : storedData;
    return jsonResponse({ data, slug: normalizedOrError.slugKey });
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return errorResponse(404, "NOT_FOUND", "Puck page data does not exist");
    }
    if (error instanceof StoredContentInvalidError) {
      return errorResponse(500, error.code, "Stored Puck content is invalid");
    }
    return errorResponse(500, "INTERNAL_ERROR", "Unexpected server error");
  }
}

export async function handlePuckPost(
  request: Request,
  repository: PuckApiRepository,
) {
  const denied = authorize(request, true);
  if (denied) return denied;

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
  if (normalizedOrError instanceof Response) return normalizedOrError;

  try {
    return jsonResponse(await repository.publishPage(
      normalizedOrError.slugSegments,
      dataValue,
    ));
  } catch (error) {
    if (error instanceof PageDocumentValidationError) {
      return errorResponse(422, error.code, error.message, error.issues);
    }
    if (error instanceof ContentPersistenceError) {
      return errorResponse(500, error.code, "Failed to persist Puck content");
    }
    return errorResponse(500, "INTERNAL_ERROR", "Unexpected server error");
  }
}
