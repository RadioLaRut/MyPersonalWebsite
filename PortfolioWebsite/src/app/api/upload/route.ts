import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { assertLocalEditorAccess } from "@/lib/security";
import {
  createUploadFileName,
  UploadValidationError,
} from "@/lib/upload-policy";

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

export async function POST(request: Request) {
  const denied = assertLocalEditorAccess("api");
  if (denied) {
    return denied;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return errorResponse(400, "BAD_REQUEST", "Content-Type must be multipart/form-data");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
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
    await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const destination = resolveUploadDestination(outputName);
    await fs.writeFile(destination, fileBuffer);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return errorResponse(error.status, error.code, error.message);
    }

    return errorResponse(500, "INTERNAL_ERROR", "Failed to persist upload");
  }

  return jsonResponse({
    url: `/images/puck/${outputName}`,
  });
}
