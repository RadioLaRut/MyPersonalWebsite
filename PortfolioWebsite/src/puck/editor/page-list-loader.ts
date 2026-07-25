import type { PageSummary } from "@/lib/editor-page-contract";

export const PAGE_LIST_ACCESS_DENIED_MESSAGE =
  "页面清单加载失败：本地编辑器访问被拒绝。请确认使用 npm run dev:test，并通过 localhost 或 127.0.0.1 打开。";

export const PAGE_LIST_INVALID_RESPONSE_MESSAGE =
  "页面清单加载失败：本地编辑器接口返回了无效数据。";

export const PAGE_LIST_NETWORK_ERROR_MESSAGE =
  "页面清单加载失败：无法连接本地编辑器接口。请确认 npm run dev:test 仍在运行。";

type PageListFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type LoadPuckPageSlugsOptions = {
  fetcher?: PageListFetcher;
  signal?: AbortSignal;
};

export type PageListLoadResult =
  | {
    pages: PageSummary[];
    status: "ready";
    slugs: string[];
  }
  | {
    status: "error";
    message: string;
  };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown) {
  return isRecord(error) && error.name === "AbortError";
}

function isValidSlugList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((slug) => typeof slug === "string" && slug.length > 0)
  );
}

function isValidPageSummaryList(value: unknown): value is PageSummary[] {
  return (
    Array.isArray(value) &&
    value.every((page) => (
      isRecord(page) &&
      typeof page.slug === "string" &&
      typeof page.publicPath === "string" &&
      typeof page.title === "string"
    ))
  );
}

function getErrorCode(payload: unknown) {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return null;
  }

  return typeof payload.error.code === "string" ? payload.error.code : null;
}

export async function loadPuckPageSlugs({
  fetcher = fetch,
  signal,
}: LoadPuckPageSlugsOptions = {}): Promise<PageListLoadResult> {
  let response: Response;
  try {
    response = await fetcher("/api/puck?list=1", {
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return {
      status: "error",
      message: PAGE_LIST_NETWORK_ERROR_MESSAGE,
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      status: "error",
      message: PAGE_LIST_INVALID_RESPONSE_MESSAGE,
    };
  }

  const errorCode = getErrorCode(payload);
  if (
    response.status === 403 ||
    errorCode === "UNAUTHORIZED" ||
    errorCode === "EDITOR_TOKEN_REQUIRED"
  ) {
    return {
      status: "error",
      message: PAGE_LIST_ACCESS_DENIED_MESSAGE,
    };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: `页面清单加载失败：本地编辑器接口返回 HTTP ${response.status}。`,
    };
  }

  if (
    !isRecord(payload) ||
    !isValidSlugList(payload.slugs) ||
    !isValidPageSummaryList(payload.pages)
  ) {
    return {
      status: "error",
      message: PAGE_LIST_INVALID_RESPONSE_MESSAGE,
    };
  }

  return {
    pages: payload.pages,
    status: "ready",
    slugs: payload.slugs,
  };
}
