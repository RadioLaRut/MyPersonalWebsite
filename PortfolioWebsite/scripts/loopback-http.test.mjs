import assert from "node:assert/strict";
import test from "node:test";

import { assertLoopbackHttpTarget } from "./loopback-http.mjs";

test("loopback HTTP validator accepts only exact loopback targets", () => {
  for (const target of [
    "http://127.0.0.1:3000/",
    "http://localhost/",
    "https://[::1]:8443/path",
  ]) {
    assert.doesNotThrow(() => assertLoopbackHttpTarget(target));
  }

  for (const target of [
    "http://0.0.0.0:3000/",
    "http://192.168.1.10/",
    "http://localhost.example/",
    "http://user@localhost/",
    "ftp://localhost/",
    "https://example.test/",
  ]) {
    assert.throws(
      () => assertLoopbackHttpTarget(target),
      /exact loopback/u,
    );
  }
});
