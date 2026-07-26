import path from "node:path";

import {
  COMPONENT_DESIGN_CONFIG_FILE,
  getComponentDesignRevision,
  hasComponentDesignConfig,
  readComponentDesignConfig,
  writeComponentDesignConfig,
} from "./component-design-config.ts";
import {
  parseCurrentComponentDesignDocument,
  type ComponentDesignDocument,
} from "./component-design-v2.ts";
import { CONTENT_BUDGET_PROFILE_V1 } from "./content-budget.ts";
import {
  readJsonWithLimit,
  RequestBodyError,
} from "./request-body-policy.ts";
import { LocalEditorRoutePolicy } from "./local-editor-route-policy.ts";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

export type ComponentDesignRepository = {
  configPath: string;
  hasSaved: () => Promise<boolean>;
  read: () => Promise<ComponentDesignDocument>;
  write: (document: ComponentDesignDocument) => Promise<void>;
};

const defaultRepository: ComponentDesignRepository = {
  configPath: COMPONENT_DESIGN_CONFIG_FILE,
  hasSaved: () => hasComponentDesignConfig(),
  read: () => readComponentDesignConfig(),
  write: (document) => writeComponentDesignConfig(document),
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

  const rawConfig = payload && typeof payload === "object" && "config" in payload
    ? (payload as { config?: unknown }).config
    : undefined;
  const baseRevision = payload && typeof payload === "object" &&
      "baseRevision" in payload
    ? (payload as { baseRevision?: unknown }).baseRevision
    : undefined;

  const document = parseCurrentComponentDesignDocument(rawConfig);
  if (!document || typeof baseRevision !== "string" || !baseRevision) {
    return errorResponse(400, "BAD_REQUEST", "Request body is invalid");
  }

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
          revision: currentRevision,
        },
        409,
      );
    }

    await repository.write(document);
    return jsonResponse({
      config: document,
      ok: true,
      path: relativeConfigPath(repository.configPath),
      revision: getComponentDesignRevision(document),
    });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Failed to save component design config");
  }
}
