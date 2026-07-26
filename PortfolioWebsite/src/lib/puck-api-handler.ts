import type { ContentRepository } from "./content-repository.ts";
import {
  CONTENT_BUDGET_PROFILE_V1,
  ContentBudgetExceededError,
  ContentQuotaExceededError,
} from "./content-budget.ts";
import {
  ContentAlreadyExistsError,
  ContentNotFoundError,
  ContentPersistenceError,
  StoredContentInvalidError,
} from "./content-repository.ts";
import { isCreatePageRequest } from "./editor-page-contract.ts";
import { isJsonValue, isPlainRecord } from "./json-utils.ts";
import { LocalEditorRoutePolicy } from "./local-editor-route-policy.ts";
import { PageDocumentValidationError } from "./page-document-contract.ts";
import {
  readJsonWithLimit,
  RequestBodyError,
} from "./request-body-policy.ts";
import { synchronizeNextProjectBlocks } from "./project-catalog.ts";
import { normalizePuckSlugInput, SlugValidationError } from "./puck-slug.ts";

type PuckApiRepository = Pick<
  ContentRepository,
  | "createPage"
  | "listPageSlugs"
  | "listPageSummaries"
  | "publishPage"
  | "readPage"
  | "readProjectCatalog"
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
  return LocalEditorRoutePolicy.authorizeApi(
    request,
    requireToken ? "write" : "read",
  ) ?? null;
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
      const pages = await repository.listPageSummaries();
      return jsonResponse({
        pages,
        slugs: pages.map((page) => page.slug),
      });
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

export async function handlePuckPut(
  request: Request,
  repository: PuckApiRepository,
) {
  const denied = authorize(request, true);
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await readJsonWithLimit(
      request,
      CONTENT_BUDGET_PROFILE_V1.requestBytes.puckJson,
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return errorResponse(error.status, error.code, error.message);
    }
    return errorResponse(400, "BAD_REQUEST", "Request body must be valid JSON");
  }

  if (!isCreatePageRequest(payload)) {
    return errorResponse(
      400,
      "BAD_REQUEST",
      "Request body must contain slug and a valid blank or duplicate mode",
    );
  }

  try {
    return jsonResponse(await repository.createPage(payload), 201);
  } catch (error) {
    if (error instanceof SlugValidationError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof ContentAlreadyExistsError) {
      return errorResponse(409, error.code, "A page already exists at this path");
    }
    if (error instanceof ContentNotFoundError) {
      return errorResponse(404, error.code, "The source page does not exist");
    }
    if (error instanceof PageDocumentValidationError) {
      return errorResponse(422, error.code, error.message, error.issues);
    }
    if (error instanceof ContentBudgetExceededError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof ContentQuotaExceededError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof ContentPersistenceError) {
      return errorResponse(500, error.code, "Failed to create Puck content");
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
    payload = await readJsonWithLimit(
      request,
      CONTENT_BUDGET_PROFILE_V1.requestBytes.puckJson,
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return errorResponse(error.status, error.code, error.message);
    }
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
    if (error instanceof ContentBudgetExceededError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof ContentQuotaExceededError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof PageDocumentValidationError) {
      return errorResponse(422, error.code, error.message, error.issues);
    }
    if (error instanceof ContentPersistenceError) {
      return errorResponse(500, error.code, "Failed to persist Puck content");
    }
    return errorResponse(500, "INTERNAL_ERROR", "Unexpected server error");
  }
}
