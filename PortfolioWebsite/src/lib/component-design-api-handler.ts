import path from "node:path";

import {
  COMPONENT_DESIGN_CONFIG_FILE,
  getComponentDesignRevision,
  hasComponentDesignConfig,
  readComponentDesignSourceConfig,
  writeComponentDesignSourceConfig,
} from "./component-design-config.ts";
import {
  isComponentDesignAuthorComponent,
  mergeComponentDesignVariantPatch,
  parseComponentDesignDocument,
  parseCurrentComponentDesignDocument,
  type ComponentDesignDocumentV3,
  type ComponentDesignVariantPatchV3,
} from "./component-design-v3.ts";
import type { ComponentDesignAuthorComponent } from "./component-design-manifest.ts";
import { isPlainRecord } from "./json-utils.ts";
import { CONTENT_BUDGET_PROFILE_V1 } from "./content-budget.ts";
import {
  readJsonWithLimit,
  RequestBodyError,
} from "./request-body-policy.ts";
import { LocalEditorRoutePolicy } from "./local-editor-route-policy.ts";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

let componentDesignWriteTail: Promise<void> = Promise.resolve();

function serializeComponentDesignWrite<T>(task: () => Promise<T>) {
  const result = componentDesignWriteTail.then(task, task);
  componentDesignWriteTail = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export type ComponentDesignRepository = {
  configPath: string;
  hasSaved: () => Promise<boolean>;
  read: () => Promise<ComponentDesignDocumentV3>;
  write: (document: ComponentDesignDocumentV3) => Promise<void>;
};

const defaultRepository: ComponentDesignRepository = {
  configPath: COMPONENT_DESIGN_CONFIG_FILE,
  hasSaved: () => hasComponentDesignConfig(),
  read: () => readComponentDesignSourceConfig(),
  write: (document) => writeComponentDesignSourceConfig(document),
};

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
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

function relativeConfigPath(configPath: string) {
  return path.relative(process.cwd(), configPath).replaceAll(path.sep, "/");
}

export type ComponentDesignPatchRequest = {
  baseRevision: string;
  componentKey: ComponentDesignAuthorComponent;
  operationId: string;
  variantKey: string;
  variantPatch: ComponentDesignVariantPatchV3;
};

export type ComponentDesignFullDocumentRequest = {
  baseRevision: string;
  config: ComponentDesignDocumentV3;
};

function parseBaseRevision(payload: Record<string, unknown>) {
  return typeof payload.baseRevision === "string" &&
      payload.baseRevision.length > 0
    ? payload.baseRevision
    : null;
}

function parseOperationId(value: unknown) {
  return typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= 128
    ? value
    : null;
}

function parsePatchRequest(
  payload: Record<string, unknown>,
): ComponentDesignPatchRequest | null {
  const baseRevision = parseBaseRevision(payload);
  const operationId = parseOperationId(payload.operationId);
  if (
    !baseRevision ||
    !operationId ||
    !isComponentDesignAuthorComponent(payload.componentKey) ||
    typeof payload.variantKey !== "string" ||
    payload.variantKey.length === 0 ||
    !isPlainRecord(payload.variantPatch)
  ) {
    return null;
  }

  return {
    baseRevision,
    componentKey: payload.componentKey,
    operationId,
    variantKey: payload.variantKey,
    variantPatch: payload.variantPatch as ComponentDesignVariantPatchV3,
  };
}

export async function handleComponentDesignGet(
  request: Request,
  repository: ComponentDesignRepository = defaultRepository,
) {
  const denied = LocalEditorRoutePolicy.authorizeApi(request, "read");
  if (denied) {
    return denied;
  }

  try {
    const hasSaved = await repository.hasSaved();
    const config = await repository.read();

    return jsonResponse({
      config,
      hasSaved,
      path: relativeConfigPath(repository.configPath),
      revision: getComponentDesignRevision(config),
    });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Failed to load component design config");
  }
}

export async function handleComponentDesignPost(
  request: Request,
  repository: ComponentDesignRepository = defaultRepository,
) {
  const denied = LocalEditorRoutePolicy.authorizeApi(request, "write");
  if (denied) {
    return denied;
  }

  let payload: unknown;
  try {
    payload = await readJsonWithLimit(
      request,
      CONTENT_BUDGET_PROFILE_V1.requestBytes.componentDesignJson,
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return errorResponse(error.status, error.code, error.message);
    }
    return errorResponse(400, "BAD_REQUEST", "Request body must be valid JSON");
  }

  if (!isPlainRecord(payload)) {
    return errorResponse(400, "BAD_REQUEST", "Request body is invalid");
  }

  const hasFullDocument = "config" in payload;
  const fullDocument = hasFullDocument
    ? parseComponentDesignDocument(payload.config)
    : null;
  const patchRequest = hasFullDocument ? null : parsePatchRequest(payload);
  const baseRevision = parseBaseRevision(payload);
  if (
    !baseRevision ||
    (hasFullDocument && !fullDocument) ||
    (!hasFullDocument && !patchRequest)
  ) {
    return errorResponse(400, "BAD_REQUEST", "Request body is invalid");
  }

  return serializeComponentDesignWrite(async () => {
    try {
      const currentDocument = await repository.read();
      const currentRevision = getComponentDesignRevision(currentDocument);
      if (currentRevision !== baseRevision) {
        return jsonResponse(
          {
            error: {
              code: "REVISION_CONFLICT",
              message: "Component design changed outside this draft",
            },
            config: currentDocument,
            revision: currentRevision,
          },
          409,
        );
      }

      const document = fullDocument ??
        mergeComponentDesignVariantPatch(
          currentDocument,
          patchRequest!.componentKey,
          patchRequest!.variantKey,
          patchRequest!.variantPatch,
        );
      if (!document || !parseCurrentComponentDesignDocument(document)) {
        return errorResponse(400, "BAD_REQUEST", "Variant patch is invalid");
      }

      await repository.write(document);
      return jsonResponse({
        config: document,
        ok: true,
        ...(patchRequest ? { operationId: patchRequest.operationId } : {}),
        path: relativeConfigPath(repository.configPath),
        revision: getComponentDesignRevision(document),
      });
    } catch {
      return errorResponse(
        500,
        "INTERNAL_ERROR",
        "Failed to save component design config",
      );
    }
  });
}
