import assert from "node:assert/strict";
import test from "node:test";

import { NextRequest } from "next/server.js";

import { middleware } from "./middleware.ts";

function makeRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "https://example.test"));
}

test("middleware redirects legacy work aliases to canonical paths", () => {
  const response = middleware(makeRequest("/works/penguin-trading-company"));

  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://example.test/works/penguin");
});

test("middleware permanently redirects the legacy holy-tank work alias", () => {
  const response = middleware(makeRequest("/works/holy-tank"));

  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://example.test/works/wow-otto");
});

test("middleware rejects invalid works paths before routing", async () => {
  const response = middleware(makeRequest("/works/%ZZ"));

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    error: {
      code: "BAD_REQUEST",
      message: "Invalid slug path",
    },
  });
});
