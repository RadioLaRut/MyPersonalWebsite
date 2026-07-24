export class RequestBodyError extends Error {
  readonly code: "BAD_REQUEST" | "PAYLOAD_TOO_LARGE";
  readonly status: 400 | 413;

  constructor(
    message: string,
    status: 400 | 413 = 400,
    code: "BAD_REQUEST" | "PAYLOAD_TOO_LARGE" = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "RequestBodyError";
    this.code = code;
    this.status = status;
  }
}

function payloadTooLarge(maxBytes: number) {
  return new RequestBodyError(
    `Request body exceeds ${maxBytes} bytes`,
    413,
    "PAYLOAD_TOO_LARGE",
  );
}

function validateContentLength(request: Request, maxBytes: number) {
  const rawLength = request.headers.get("content-length");
  if (rawLength === null) return;
  if (!/^[0-9]+$/u.test(rawLength)) {
    throw new RequestBodyError("Content-Length must be a non-negative integer");
  }

  const contentLength = Number(rawLength);
  if (!Number.isSafeInteger(contentLength)) {
    throw new RequestBodyError("Content-Length is invalid");
  }
  if (contentLength > maxBytes) {
    throw payloadTooLarge(maxBytes);
  }
}

export async function readBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<Uint8Array> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new TypeError("maxBytes must be a non-negative safe integer");
  }
  validateContentLength(request, maxBytes);

  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw payloadTooLarge(maxBytes);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function readJsonWithLimit(
  request: Request,
  maxBytes: number,
): Promise<unknown> {
  const body = await readBodyWithLimit(request, maxBytes);
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    throw new RequestBodyError("Request body must use valid UTF-8");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new RequestBodyError("Request body must be valid JSON");
  }
}

export function rebuildRequestWithBody(
  request: Request,
  body: Uint8Array,
): Request {
  const bodyBuffer = new ArrayBuffer(body.byteLength);
  new Uint8Array(bodyBuffer).set(body);
  return new Request(request.url, {
    body: bodyBuffer,
    headers: request.headers,
    method: request.method,
  });
}
