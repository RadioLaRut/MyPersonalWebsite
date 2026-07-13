import type { NextRequest } from "next/server";

import { contentRepository } from "@/lib/content-repository";
import { handlePuckGet, handlePuckPost } from "@/lib/puck-api-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return handlePuckGet(request, contentRepository);
}

export function POST(request: NextRequest) {
  return handlePuckPost(request, contentRepository);
}
