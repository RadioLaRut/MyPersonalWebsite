type ComponentLabSaveErrorPayload = {
  error?: {
    code?: unknown;
  };
};

export function isComponentLabEditorTokenRequired(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  return (payload as ComponentLabSaveErrorPayload).error?.code ===
    "EDITOR_TOKEN_REQUIRED";
}
