import { randomUUID } from "node:crypto";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MIME_TYPES_BY_EXTENSION: Readonly<Record<string, readonly string[]>> = {
  ".avif": ["image/avif"],
  ".gif": ["image/gif"],
  ".jpeg": ["image/jpeg"],
  ".jpg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};
const ENCODED_TRAVERSAL_PATTERN = /%2e%2e|%2f|%5c/i;

export class UploadValidationError extends Error {
  readonly status: number;
  readonly code: "BAD_REQUEST" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE";

  constructor(
    message: string,
    status: number,
    code: "BAD_REQUEST" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE",
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function makeSafeStem(rawName: string) {
  const stem = rawName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return stem || "upload";
}

export function createUploadFileName(originalName: string, mimeType: string, size: number) {
  if (!originalName || typeof originalName !== "string") {
    throw new UploadValidationError("Missing file name", 400, "BAD_REQUEST");
  }

  if (originalName.includes("\0")) {
    throw new UploadValidationError("Invalid file name", 400, "BAD_REQUEST");
  }

  if (ENCODED_TRAVERSAL_PATTERN.test(originalName)) {
    throw new UploadValidationError("Invalid file path", 400, "BAD_REQUEST");
  }

  let decodedName: string;
  try {
    decodedName = decodeURIComponent(originalName);
  } catch {
    throw new UploadValidationError("Invalid file name encoding", 400, "BAD_REQUEST");
  }

  if (
    decodedName.includes("/") ||
    decodedName.includes("\\") ||
    decodedName.includes("..") ||
    decodedName.includes("\0")
  ) {
    throw new UploadValidationError("Invalid file path", 400, "BAD_REQUEST");
  }

  const safeName = path.basename(decodedName);
  const extension = path.extname(safeName).toLowerCase();
  if (extension === ".svg" || mimeType === "image/svg+xml") {
    throw new UploadValidationError("SVG uploads are not supported", 415, "UNSUPPORTED_MEDIA_TYPE");
  }

  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new UploadValidationError("Unsupported media type", 415, "UNSUPPORTED_MEDIA_TYPE");
  }

  if (!MIME_TYPES_BY_EXTENSION[extension]?.includes(mimeType)) {
    throw new UploadValidationError(
      "File extension does not match its media type",
      415,
      "UNSUPPORTED_MEDIA_TYPE",
    );
  }

  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new UploadValidationError("File must not be empty", 400, "BAD_REQUEST");
  }

  if (size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError(
      `File is too large. Maximum size is ${MAX_UPLOAD_BYTES} bytes`,
      413,
      "PAYLOAD_TOO_LARGE",
    );
  }

  const stem = makeSafeStem(path.basename(safeName, extension));
  return `${stem}-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
}

export function validateUploadBytes(bytes: Uint8Array, mimeType: string) {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  const matches =
    (mimeType === "image/jpeg" && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    (mimeType === "image/png" && bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => (
      value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]
    ))) ||
    (mimeType === "image/webp" && bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") ||
    (mimeType === "image/gif" && bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(ascii(0, 6))) ||
    (mimeType === "image/avif" && bytes.length >= 12 && ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12)));

  if (!matches) {
    throw new UploadValidationError(
      "File signature does not match its media type",
      415,
      "UNSUPPORTED_MEDIA_TYPE",
    );
  }
}
