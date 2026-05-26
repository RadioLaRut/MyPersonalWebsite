export const PREVIEW_REFERENCE_VIEWPORT_PX = 1440;

export const PREVIEW_VIEWPORTS = [
  { height: 844, icon: "Smartphone", key: "mobile", label: "Mobile", width: 390 },
  { height: 1180, icon: "Tablet", key: "tablet", label: "Tablet", width: 820 },
  { height: 960, icon: "Monitor", key: "desktop", label: "Desktop", width: 1440 },
] as const;

export type PreviewViewportKey = (typeof PREVIEW_VIEWPORTS)[number]["key"];

export const DEFAULT_PREVIEW_VIEWPORT =
  PREVIEW_VIEWPORTS[PREVIEW_VIEWPORTS.length - 1];

export const PUCK_PREVIEW_VIEWPORTS = PREVIEW_VIEWPORTS.map((viewport) => ({
  height: viewport.height,
  icon: viewport.icon,
  label: viewport.label,
  width: viewport.width,
}));
