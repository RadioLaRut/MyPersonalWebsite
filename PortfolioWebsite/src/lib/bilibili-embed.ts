const BILIBILI_VIDEO_ID_PATTERN = /^BV[0-9A-Za-z]{10}$/;
const BILIBILI_VIDEO_PATH_PATTERN = /^\/video\/(BV[0-9A-Za-z]{10})\/?$/;
const BILIBILI_VIDEO_HOSTS = new Set([
  "bilibili.com",
  "m.bilibili.com",
  "www.bilibili.com",
]);

export type BilibiliVideoSource = {
  bvid: string;
  embedUrl: string;
  p?: number;
  t?: number;
  watchUrl: string;
};

export function resolveBilibiliEmbedTitle(title: unknown) {
  if (typeof title !== "string") return "哔哩哔哩视频";
  const trimmed = title.trim();
  return trimmed || "哔哩哔哩视频";
}

function parseIntegerParameter(
  value: string | null,
  minimum: number,
): number | undefined | null {
  if (value === null || value === "") return undefined;
  if (!/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) return null;
  return parsed;
}

function buildBilibiliVideoSource(
  bvid: string,
  p?: number,
  t?: number,
): BilibiliVideoSource {
  const playerParameters = new URLSearchParams({
    bvid,
    poster: "1",
    autoplay: "0",
    danmaku: "0",
    refer: "0",
  });
  const watchParameters = new URLSearchParams();

  if (p !== undefined) {
    playerParameters.set("p", String(p));
    watchParameters.set("p", String(p));
  }
  if (t !== undefined) {
    playerParameters.set("t", String(t));
    watchParameters.set("t", String(t));
  }

  const watchQuery = watchParameters.toString();
  return {
    bvid,
    embedUrl: `https://player.bilibili.com/player.html?${playerParameters.toString()}`,
    p,
    t,
    watchUrl: `https://www.bilibili.com/video/${bvid}${watchQuery ? `?${watchQuery}` : ""}`,
  };
}

export function parseBilibiliVideoSource(
  source: unknown,
): BilibiliVideoSource | null {
  if (typeof source !== "string") return null;
  const trimmed = source.trim();
  if (!trimmed) return null;

  if (BILIBILI_VIDEO_ID_PATTERN.test(trimmed)) {
    return buildBilibiliVideoSource(trimmed);
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    !BILIBILI_VIDEO_HOSTS.has(url.hostname.toLowerCase()) ||
    url.username ||
    url.password ||
    url.hash
  ) {
    return null;
  }

  const pathMatch = BILIBILI_VIDEO_PATH_PATTERN.exec(url.pathname);
  if (!pathMatch) return null;

  const allowedQueryKeys = new Set(["p", "t"]);
  if ([...url.searchParams.keys()].some((key) => !allowedQueryKeys.has(key))) {
    return null;
  }
  if (
    url.searchParams.getAll("p").length > 1 ||
    url.searchParams.getAll("t").length > 1
  ) {
    return null;
  }

  const p = parseIntegerParameter(url.searchParams.get("p"), 1);
  const t = parseIntegerParameter(url.searchParams.get("t"), 0);
  if (p === null || t === null) return null;

  return buildBilibiliVideoSource(pathMatch[1], p, t);
}
