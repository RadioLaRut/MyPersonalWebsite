import assert from "node:assert/strict";
import test from "node:test";

import {
  readBodyWithLimit,
  readJsonWithLimit,
  rebuildRequestWithBody,
  RequestBodyError,
} from "./request-body-policy.ts";

function post(body: BodyInit, headers?: HeadersInit) {
  return new Request("http://localhost/api/test", {
    body,
    headers,
    method: "POST",
  });
}

test("bounded body reader accepts the exact byte limit and rejects the next byte", async () => {
  assert.deepEqual(
    await readBodyWithLimit(post("1234"), 4),
    new TextEncoder().encode("1234"),
  );

  await assert.rejects(
    () => readBodyWithLimit(post("12345"), 4),
    (error) => (
      error instanceof RequestBodyError &&
      error.status === 413 &&
      error.code === "PAYLOAD_TOO_LARGE"
    ),
  );
});

test("actual streamed bytes remain authoritative when Content-Length is absent or understated", async () => {
  await assert.rejects(
    () => readBodyWithLimit(post("12345", { "content-length": "1" }), 4),
    /exceeds 4 bytes/u,
  );
  await assert.rejects(
    () => readBodyWithLimit(post("1", { "content-length": "5" }), 4),
    /exceeds 4 bytes/u,
  );
});

test("bounded JSON reader validates UTF-8 and JSON syntax", async () => {
  assert.deepEqual(await readJsonWithLimit(post('{"ok":true}'), 32), { ok: true });
  await assert.rejects(() => readJsonWithLimit(post("{"), 32), /valid JSON/u);
  await assert.rejects(
    () => readJsonWithLimit(post(Uint8Array.from([0xff])), 32),
    /valid UTF-8/u,
  );
});

test("a bounded multipart body can be rebuilt before formData parsing", async () => {
  const original = post("field=value", {
    "content-type": "application/x-www-form-urlencoded",
  });
  const body = await readBodyWithLimit(original, 32);
  const rebuilt = rebuildRequestWithBody(original, body);
  const formData = await rebuilt.formData();

  assert.equal(formData.get("field"), "value");
});
