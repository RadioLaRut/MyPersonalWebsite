import assert from "node:assert/strict";
import test from "node:test";

import {
  createUploadFileName,
  MAX_UPLOAD_BYTES,
  UploadValidationError,
  validateUploadBytes,
} from "./upload-policy.ts";

test("upload policy accepts matching raster image metadata", () => {
  assert.match(createUploadFileName("Hero Image.PNG", "image/png", 128), /^hero-image-.*\.png$/);
});

test("upload policy rejects traversal, SVG, empty, oversized, and mismatched files", () => {
  const invalidCases: Array<() => unknown> = [
    () => createUploadFileName("../secret.png", "image/png", 128),
    () => createUploadFileName("image.svg", "image/svg+xml", 128),
    () => createUploadFileName("image.png", "image/png", 0),
    () => createUploadFileName("image.png", "image/png", MAX_UPLOAD_BYTES + 1),
    () => createUploadFileName("image.png", "image/jpeg", 128),
  ];

  for (const invalidCase of invalidCases) {
    assert.throws(invalidCase, UploadValidationError);
  }
});

test("upload policy validates file signatures before persistence", () => {
  validateUploadBytes(
    Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    "image/png",
  );
  assert.throws(
    () => validateUploadBytes(Uint8Array.from([0xff, 0xd8, 0xff]), "image/png"),
    UploadValidationError,
  );
});
