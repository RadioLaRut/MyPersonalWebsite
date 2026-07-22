export type PublishState = "idle" | "publishing" | "published" | "error";
export type SaveTrigger = "manual" | "auto";

export type SaveStatusNoticeModel = {
  detail: string;
  title: string;
  tone: "warning" | "progress" | "success" | "error";
};

type SaveStatusNoticeOptions = {
  errorMessage: string | null;
  hasUnsavedChanges: boolean;
  publishState: PublishState;
  saveTrigger: SaveTrigger;
};

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

export const AUTO_SAVE_INTERVAL_MS = 30_000;
export const DEFAULT_SAVE_ERROR_MESSAGE = "更改尚未保存。请检查浏览器控制台和本地编辑 Token 后重试。";

const AUTO_SAVE_INTERVAL_SECONDS = AUTO_SAVE_INTERVAL_MS / 1_000;

export function getApiSaveErrorMessage(payload: SaveApiPayload, responseStatus: number) {
  if (payload.error?.code === "EDITOR_TOKEN_REQUIRED") {
    return "浏览器中的本地编辑 Token 缺失，或与 .env.local 不一致。请重新启用编辑 Token 后重试。";
  }

  const firstIssue = payload.error?.issues?.[0];
  if (payload.error?.code === "INVALID_CONTENT" && firstIssue) {
    const remainingIssueCount = (payload.error.issues?.length ?? 1) - 1;
    const remainingIssueLabel = remainingIssueCount > 0 ? `（另有 ${remainingIssueCount} 项）` : "";
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

export function getSaveStatusNotice({
  errorMessage,
  hasUnsavedChanges,
  publishState,
  saveTrigger,
}: SaveStatusNoticeOptions): SaveStatusNoticeModel | null {
  if (publishState === "idle" && !hasUnsavedChanges) {
    return null;
  }

  if (publishState === "publishing") {
    return {
      detail: "正在将当前页面写入内容文件，请稍候。",
      title: saveTrigger === "auto" ? "正在自动保存" : "正在发布",
      tone: "progress",
    };
  }

  if (publishState === "error") {
    return {
      detail: errorMessage || DEFAULT_SAVE_ERROR_MESSAGE,
      title: saveTrigger === "auto" ? "自动保存失败" : "发布失败",
      tone: "error",
    };
  }

  if (publishState === "published" && !hasUnsavedChanges) {
    return {
      detail: "当前页面已经写入内容文件，现在可以安全刷新。",
      title: saveTrigger === "auto" ? "已自动保存" : "发布成功，已保存",
      tone: "success",
    };
  }

  if (publishState === "published") {
    return {
      detail: `请再次点击 Publish，或等待 ${AUTO_SAVE_INTERVAL_SECONDS} 秒内的下一次自动保存。`,
      title: "上一轮保存成功，但仍有新更改",
      tone: "warning",
    };
  }

  return {
    detail: `系统会在 ${AUTO_SAVE_INTERVAL_SECONDS} 秒内自动保存，也可以立即点击 Publish。`,
    title: "有未保存的更改",
    tone: "warning",
  };
}
