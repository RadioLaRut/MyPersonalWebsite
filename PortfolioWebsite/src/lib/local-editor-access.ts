export const LOCAL_EDITOR_ACCESS_HEADER = "x-local-editor-token";
export const LOCAL_EDITOR_ACCESS_TOKEN_ENV = "LOCAL_EDITOR_ACCESS_TOKEN";
export const LOCAL_EDITOR_ACCESS_TOKENS_ENV = "LOCAL_EDITOR_ACCESS_TOKENS";
export const LOCAL_EDITOR_ACCESS_STORAGE_KEY = "portfolio.localEditorAccessToken";

type LocalEditorAccessStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function getBrowserLocalEditorAccessStorage(): LocalEditorAccessStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getLocalEditorAccessToken(
  storage: LocalEditorAccessStorage | null = getBrowserLocalEditorAccessStorage(),
) {
  return storage?.getItem(LOCAL_EDITOR_ACCESS_STORAGE_KEY) ?? null;
}

export function setLocalEditorAccessToken(
  rawToken: string,
  storage: LocalEditorAccessStorage | null = getBrowserLocalEditorAccessStorage(),
) {
  const token = rawToken.trim();
  if (!storage || !token) return false;

  storage.setItem(LOCAL_EDITOR_ACCESS_STORAGE_KEY, token);
  return true;
}

export function getLocalEditorAccessHeaders(
  storage: LocalEditorAccessStorage | null = getBrowserLocalEditorAccessStorage(),
): Record<string, string> {
  const token = getLocalEditorAccessToken(storage);
  return token ? { [LOCAL_EDITOR_ACCESS_HEADER]: token } : {};
}
