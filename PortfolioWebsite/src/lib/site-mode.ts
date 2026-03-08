function getSiteMode(): string {
  return process.env.NEXT_PUBLIC_SITE_MODE ?? "";
}

export function isTestingMode(): boolean {
  return getSiteMode() === "testing";
}

export function isCmsPreviewEnabled(): boolean {
  return true;
}

export function usesJsonContent(): boolean {
  return true;
}
