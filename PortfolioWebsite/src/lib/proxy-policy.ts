import {
  analyzePublicPath,
  tryNormalizeLegacyPublicRedirectPath,
  type WorkAliasResolver,
} from "./public-paths.ts";

export type ProxyDecision =
  | { kind: "bad-request" }
  | { kind: "next" }
  | { kind: "redirect"; pathname: string; status: 307 | 308 };

export function evaluateProxyPath(
  pathname: string,
  resolveWorkAlias?: WorkAliasResolver,
): ProxyDecision {
  if (pathname === "/p" || pathname === "/p/" || pathname.startsWith("/p/")) {
    const redirectPath = tryNormalizeLegacyPublicRedirectPath(pathname, resolveWorkAlias);
    return redirectPath
      ? { kind: "redirect", pathname: redirectPath, status: 307 }
      : { kind: "bad-request" };
  }

  if (pathname === "/works" || pathname.startsWith("/works/")) {
    const result = analyzePublicPath(pathname, resolveWorkAlias);
    if (result.kind === "bad") return { kind: "bad-request" };
    if (result.kind === "redirect") {
      return { kind: "redirect", pathname: result.to, status: 308 };
    }
  }

  return { kind: "next" };
}
