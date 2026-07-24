import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";

import {
  assertAggregateContentQuota,
  CONTENT_BUDGET_PROFILE_V1,
  ContentQuotaExceededError,
} from "@/lib/content-budget";
import { withContentWriteQueue } from "@/lib/content-write-queue";
import {
  MediaBudgetError,
  readAndValidateMediaMetadata,
  SHARP_MEDIA_INPUT_OPTIONS,
} from "@/lib/media-budget";
import {
  readBodyWithLimit,
  rebuildRequestWithBody,
  RequestBodyError,
} from "@/lib/request-body-policy";
import { assertLocalEditorApiAccess } from "@/lib/security";
import {
  createUploadFileName,
  UploadValidationError,
  validateUploadBytes,
} from "@/lib/upload-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE_HEADER = {
  "Cache-Control": "no-store",
} as const;

const UPLOAD_DIRECTORY = path.resolve(process.cwd(), "public/images/puck");

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    headers: NO_STORE_HEADER,
    status,
  });
}

function errorResponse(status: number, code: string, message: string) {
  return jsonResponse(
    {
      error: {
        code,
        message,
      },
    },
    status,
  );
}

function resolveUploadDestination(outputName: string) {
  const resolvedPath = path.resolve(UPLOAD_DIRECTORY, outputName);
  const normalizedRoot = `${UPLOAD_DIRECTORY}${path.sep}`;
  if (resolvedPath !== UPLOAD_DIRECTORY && !resolvedPath.startsWith(normalizedRoot)) {
    throw new UploadValidationError("Invalid file path", 400, "BAD_REQUEST");
  }

  return resolvedPath;
}

async function collectUploadUsage() {
  const directories = [UPLOAD_DIRECTORY];
  let bytes = 0;
  let files = 0;

  while (directories.length > 0) {
    const directory = directories.pop();
    if (!directory) break;
    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }

    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        directories.push(absolutePath);
      } else if (entry.isFile()) {
        files += 1;
        bytes += (await fs.stat(absolutePath)).size;
      }
    }
  }

  return { bytes, files };
}

function assertUploadQuota(
  usage: Awaited<ReturnType<typeof collectUploadUsage>>,
  nextFileBytes: number,
) {
  assertAggregateContentQuota(
    usage,
    nextFileBytes,
    {
      maxBytes: CONTENT_BUDGET_PROFILE_V1.storage.puckImageBytes,
      maxFiles: CONTENT_BUDGET_PROFILE_V1.storage.puckImageFiles,
    },
  );
}

export async function POST(request: Request) {
  const denied = assertLocalEditorApiAccess(request, { requireToken: true });
  if (denied) {
    return denied;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return errorResponse(400, "BAD_REQUEST", "Content-Type must be multipart/form-data");
  }

  let formData: FormData;
  try {
    const body = await readBodyWithLimit(
      request,
      CONTENT_BUDGET_PROFILE_V1.requestBytes.multipart,
    );
    formData = await rebuildRequestWithBody(request, body).formData();
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return errorResponse(error.status, error.code, error.message);
    }
    return errorResponse(400, "BAD_REQUEST", "Invalid multipart payload");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return errorResponse(400, "BAD_REQUEST", "Form field 'file' is required");
  }

  let outputName: string;
  try {
    outputName = createUploadFileName(file.name, file.type, file.size);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return errorResponse(error.status, error.code, error.message);
    }

    return errorResponse(500, "INTERNAL_ERROR", "Unexpected upload validation error");
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    validateUploadBytes(fileBuffer, file.type);
    await readAndValidateMediaMetadata(
      () => sharp(fileBuffer, SHARP_MEDIA_INPUT_OPTIONS).metadata(),
    );
    const destination = resolveUploadDestination(outputName);
    await withContentWriteQueue(async () => {
      const usage = await collectUploadUsage();
      assertUploadQuota(usage, fileBuffer.byteLength);
      await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
      await fs.writeFile(destination, fileBuffer, { flag: "wx" });
    });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof MediaBudgetError) {
      return errorResponse(415, "UNSUPPORTED_MEDIA_TYPE", error.message);
    }
    if (error instanceof ContentQuotaExceededError) {
      return errorResponse(error.status, error.code, error.message);
    }

    return errorResponse(500, "INTERNAL_ERROR", "Failed to persist upload");
  }

  return jsonResponse({
    url: `/images/puck/${outputName}`,
  });
}
