export type SaveState = "saved" | "dirty" | "saving" | "error";
export type SaveTrigger = "manual" | "auto";

type SaveApiPayload = {
  error?: {
    code: string;
    issues?: Array<{
      message: string;
      path: string;
    }>;
    message: string;
  };
};

export const AUTO_SAVE_INTERVAL_MS = 180_000;
export const DEFAULT_SAVE_ERROR_MESSAGE =
  "更改尚未保存。请检查浏览器控制台和本地编辑 Token 后重试。";

export function getApiSaveErrorMessage(payload: SaveApiPayload, responseStatus: number) {
  if (payload.error?.code === "EDITOR_TOKEN_REQUIRED") {
    return "浏览器中的本地编辑 Token 缺失，或不在 .env.local 允许的 Token 列表中。请为这台电脑重新设置 Token 后重试。";
  }

  const firstIssue = payload.error?.issues?.[0];
  if (payload.error?.code === "INVALID_CONTENT" && firstIssue) {
    const remainingIssueCount = (payload.error.issues?.length ?? 1) - 1;
    const remainingIssueLabel = remainingIssueCount > 0
      ? `（另有 ${remainingIssueCount} 项）`
      : "";
    return `内容校验失败：${firstIssue.path}：${firstIssue.message}${remainingIssueLabel}`;
  }

  return payload.error?.message || `保存请求失败（HTTP ${responseStatus}）。`;
}

export function getUnexpectedSaveErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return DEFAULT_SAVE_ERROR_MESSAGE;
  }

  if (error.name === "SecurityError") {
    return "浏览器禁止读取本地编辑 Token。请允许 localhost 使用本地存储后重试。";
  }

  if (/failed to fetch|networkerror|network request failed/i.test(error.message)) {
    return "无法连接本地保存接口。请确认 npm run dev:test 仍在运行后重试。";
  }

  return error.message || DEFAULT_SAVE_ERROR_MESSAGE;
}

export function getSaveStateLabel(saveState: SaveState) {
  return {
    dirty: "有未保存修改",
    error: "保存失败",
    saved: "已保存",
    saving: "保存中",
  }[saveState];
}
