import { NextResponse } from "next/server";

import {
  getImageLibraryRoot,
  ImageLibraryError,
  listImageLibraryDirectory,
} from "@/lib/image-library-server";
import { IMAGE_LIBRARY_PUBLIC_ROOT } from "@/lib/media-library-paths";
import { assertLocalEditorApiAccess } from "@/lib/security";

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

export async function GET(request: Request) {
  const denied = assertLocalEditorApiAccess(request);
  if (denied) return denied;

  let requestedDirectory = IMAGE_LIBRARY_PUBLIC_ROOT;
  try {
    requestedDirectory =
      new URL(request.url).searchParams.get("directory") ??
      IMAGE_LIBRARY_PUBLIC_ROOT;
  } catch {
    return jsonResponse(
      { error: { code: "BAD_REQUEST", message: "Invalid request URL" } },
      400,
    );
  }

  try {
    return jsonResponse(
      await listImageLibraryDirectory(
        getImageLibraryRoot(),
        requestedDirectory,
      ),
    );
  } catch (error) {
    if (error instanceof ImageLibraryError) {
      return jsonResponse(
        { error: { code: error.code, message: error.message } },
        error.status,
      );
    }

    return jsonResponse(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to read the image library",
        },
      },
      500,
    );
  }
}
