type OpenWindow = (
  url?: string | URL,
  target?: string,
  features?: string,
) => Window | null;

export function openDetachedWindow(
  url: string,
  openWindow: OpenWindow = window.open.bind(window),
): void {
  const openedWindow = openWindow(url, "_blank", "noopener,noreferrer");
  if (!openedWindow) return;

  try {
    openedWindow.opener = null;
  } catch {
    // 某些浏览器会返回不可写的跨上下文句柄；noopener 仍是主控制。
  }
}
