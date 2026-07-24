import assert from "node:assert/strict";
import test from "node:test";

import { PRODUCTION_SECURITY_HEADERS } from "./security-headers.mjs";

test("production security header baseline is explicit and excludes HSTS", () => {
  const headers = Object.fromEntries(
    PRODUCTION_SECURITY_HEADERS.map(({ key, value }) => [key, value]),
  );

  assert.equal(
    headers["Content-Security-Policy"],
    "base-uri 'self'; object-src 'none'; frame-ancestors 'self'",
  );
  assert.equal(headers["Cross-Origin-Opener-Policy"], "same-origin");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(
    headers["Permissions-Policy"],
    "camera=(), geolocation=(), microphone=()",
  );
  assert.equal(headers["X-Frame-Options"], "SAMEORIGIN");
  assert.equal(headers["Strict-Transport-Security"], undefined);
});
