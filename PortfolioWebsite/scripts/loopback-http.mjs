const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function assertLoopbackHttpTarget(rawTarget) {
  let target;
  try {
    target = new URL(rawTarget);
  } catch {
    throw new Error("HTTP target must be an absolute URL");
  }

  if (
    (target.protocol !== "http:" && target.protocol !== "https:") ||
    target.username.length > 0 ||
    target.password.length > 0 ||
    !LOOPBACK_HOSTS.has(target.hostname.toLowerCase())
  ) {
    throw new Error("HTTP target must use an exact loopback HTTP(S) address");
  }
  if (target.port) {
    const port = Number(target.port);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      throw new Error("HTTP target port is invalid");
    }
  }

  return target;
}

export async function fetchLoopback(
  rawTarget,
  init = {},
) {
  const target = assertLoopbackHttpTarget(rawTarget);
  return fetch(target, {
    ...init,
    redirect: "manual",
  });
}
