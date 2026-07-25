import fs from "node:fs/promises";

import { NextResponse } from "next/server";
import sharp from "sharp";

import {
  assertAggregateContentQuota,
  CONTENT_BUDGET_PROFILE_V1,
  ContentQuotaExceededError,
} from "@/lib/content-budget";
import { withContentWriteQueue } from "@/lib/content-write-queue";
import {
  collectImageLibraryUsage,
  ensureDefaultUploadDirectory,
  getImageLibraryRoot,
  ImageLibraryError,
  resolveImageLibraryDirectory,
  resolveUploadDestination,
} from "@/lib/image-library-server";
import {
  MediaBudgetError,
  readAndValidateMediaMetadata,
  SHARP_MEDIA_INPUT_OPTIONS,
} from "@/lib/media-budget";
import { DEFAULT_UPLOAD_PUBLIC_DIRECTORY } from "@/lib/media-library-paths";
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

function assertUploadQuota(
  usage: Awaited<ReturnType<typeof collectImageLibraryUsage>>,
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

  const directoryValue = formData.get("directory");
  if (directoryValue !== null && typeof directoryValue !== "string") {
    return errorResponse(400, "BAD_REQUEST", "Form field 'directory' must be a string");
  }
  const requestedDirectory =
    directoryValue === null
      ? DEFAULT_UPLOAD_PUBLIC_DIRECTORY
      : directoryValue;

  let outputName: string;
  try {
    outputName = createUploadFileName(file.name, file.type, file.size);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return errorResponse(error.status, error.code, error.message);
    }

    return errorResponse(500, "INTERNAL_ERROR", "Unexpected upload validation error");
  }

  let outputUrl = "";
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    validateUploadBytes(fileBuffer, file.type);
    await readAndValidateMediaMetadata(
      () => sharp(fileBuffer, SHARP_MEDIA_INPUT_OPTIONS).metadata(),
    );

    const imageLibraryRoot = getImageLibraryRoot();
    await withContentWriteQueue(async () => {
      if (requestedDirectory === DEFAULT_UPLOAD_PUBLIC_DIRECTORY) {
        await ensureDefaultUploadDirectory(imageLibraryRoot);
      }

      const uploadDirectory = await resolveImageLibraryDirectory(
        imageLibraryRoot,
        requestedDirectory,
      );
      const destination = resolveUploadDestination(uploadDirectory, outputName);
      const usage = await collectImageLibraryUsage(imageLibraryRoot);
      assertUploadQuota(usage, fileBuffer.byteLength);
      await fs.writeFile(destination.absolutePath, fileBuffer, { flag: "wx" });
      outputUrl = destination.publicPath;
    });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof ImageLibraryError) {
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
    url: outputUrl,
  });
}
