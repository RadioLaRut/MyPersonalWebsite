export const LOCAL_EDITOR_ACCESS_HEADER = "x-local-editor-token";
export const LOCAL_EDITOR_ACCESS_TOKEN_ENV = "LOCAL_EDITOR_ACCESS_TOKEN";
export const LOCAL_EDITOR_ACCESS_TOKENS_ENV = "LOCAL_EDITOR_ACCESS_TOKENS";
export const LOCAL_EDITOR_ACCESS_STORAGE_KEY = "portfolio.localEditorAccessToken";

export function getLocalEditorAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(LOCAL_EDITOR_ACCESS_STORAGE_KEY);
}

export function getLocalEditorAccessHeaders(): Record<string, string> {
  const token = getLocalEditorAccessToken();
  return token ? { [LOCAL_EDITOR_ACCESS_HEADER]: token } : {};
}
