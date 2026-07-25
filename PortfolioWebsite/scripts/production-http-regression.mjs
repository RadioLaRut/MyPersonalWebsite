import assert from "node:assert/strict";

import { assertLoopbackHttpTarget, fetchLoopback } from "./loopback-http.mjs";

const baseUrl = assertLoopbackHttpTarget(process.argv[2] ?? "");

function target(pathname) {
  const url = new URL(pathname, baseUrl);
  assertLoopbackHttpTarget(url);
  return url;
}

const checks = [];

async function checkStatus(name, pathname, expectedStatus, init) {
  const response = await fetchLoopback(target(pathname), init);
  assert.equal(response.status, expectedStatus, name);
  checks.push({ name, status: response.status });
  return response;
}

const home = await checkStatus("public-home", "/", 200);
const expectedHeaders = {
  "content-security-policy": "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; frame-src 'self' https://player.bilibili.com",
  "cross-origin-opener-policy": "same-origin",
  "permissions-policy": "camera=(), geolocation=(), microphone=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
};
for (const [header, expectedValue] of Object.entries(expectedHeaders)) {
  assert.equal(home.headers.get(header), expectedValue, header);
}
assert.equal(home.headers.get("strict-transport-security"), null);

await checkStatus("tools-page-production-closed", "/admin", 404);
await checkStatus("editor-api-production-closed", "/api/puck?list=1", 403);
await checkStatus(
  "foreign-host-preflight-closed",
  "/api/font-lab",
  403,
  { headers: { host: "example.test" } },
);
await checkStatus(
  "foreign-origin-preflight-closed",
  "/api/component-design",
  403,
  { headers: { origin: "http://example.test" } },
);

console.log(JSON.stringify({ checks, securityHeaders: Object.keys(expectedHeaders) }));
