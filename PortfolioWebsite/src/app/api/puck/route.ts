import type { NextRequest } from "next/server";

import { localEditorContentService } from "@/lib/local-editor-content-service";
import {
  handlePuckGet,
  handlePuckPost,
  handlePuckPut,
} from "@/lib/puck-api-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return handlePuckGet(request, localEditorContentService);
}

export function POST(request: NextRequest) {
  return handlePuckPost(request, localEditorContentService);
}

export function PUT(request: NextRequest) {
  return handlePuckPut(request, localEditorContentService);
}
