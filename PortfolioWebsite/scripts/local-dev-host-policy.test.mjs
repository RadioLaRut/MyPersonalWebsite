import assert from "node:assert/strict";
import test from "node:test";

import { buildNextArguments } from "./local-dev-host-policy.mjs";

test("testing dev is always bound to the IPv4 loopback address", () => {
  assert.deepEqual(buildNextArguments("testing", ["dev"]), [
    "dev",
    "--hostname",
    "127.0.0.1",
  ]);
  assert.deepEqual(buildNextArguments("testing", ["dev", "--port", "3100"]), [
    "dev",
    "--port",
    "3100",
    "--hostname",
    "127.0.0.1",
  ]);
});

test("testing dev rejects every caller-owned hostname form before spawn", () => {
  for (const nextArguments of [
    ["dev", "-H"],
    ["dev", "-H", "0.0.0.0"],
    ["dev", "-H=localhost"],
    ["dev", "-H0"],
    ["dev", "-Hx"],
    ["dev", "-Hlocalhost"],
    ["dev", "--hostname"],
    ["dev", "--hostname", "localhost"],
    ["dev", "--hostname=127.0.0.1"],
    ["dev", "--hostname", "127.0.0.1", "--hostname", "localhost"],
  ]) {
    assert.throws(
      () => buildNextArguments("testing", nextArguments),
      /owns the listener address/u,
    );
  }
});

test("non-testing commands preserve their existing arguments", () => {
  assert.deepEqual(buildNextArguments("normal", ["dev", "--hostname", "0.0.0.0"]), [
    "dev",
    "--hostname",
    "0.0.0.0",
  ]);
  assert.deepEqual(buildNextArguments("testing", ["build", "--webpack"]), [
    "build",
    "--webpack",
  ]);
  assert.deepEqual(buildNextArguments("production", ["start", "-p", "3000"]), [
    "start",
    "-p",
    "3000",
  ]);
});

test("an empty Next.js argument list is rejected", () => {
  assert.throws(() => buildNextArguments("testing", []), /include a command/u);
});
