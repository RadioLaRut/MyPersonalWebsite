function getSiteMode(): string {
  return process.env.NEXT_PUBLIC_SITE_MODE ?? "";
}

export function isTestingMode(): boolean {
  return (
    getSiteMode() === "testing" ||
    (
      process.env.NEXT_PUBLIC_ENABLE_PUCK === "true" &&
      process.env.NEXT_PUBLIC_USE_JSON === "true"
    )
  );
}

export function isCmsPreviewEnabled(): boolean {
  return (
    isTestingMode() ||
    process.env.NEXT_PUBLIC_ENABLE_PUCK === "true" ||
    process.env.NEXT_PUBLIC_USE_JSON === "true"
  );
}

export function usesJsonContent(): boolean {
  return isTestingMode() || process.env.NEXT_PUBLIC_USE_JSON === "true";
}
