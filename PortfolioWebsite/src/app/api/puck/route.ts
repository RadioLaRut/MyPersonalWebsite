import type { NextRequest } from "next/server";

import { contentRepository } from "@/lib/content-repository";
import {
  handlePuckGet,
  handlePuckPost,
  handlePuckPut,
} from "@/lib/puck-api-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return handlePuckGet(request, contentRepository);
}

export function POST(request: NextRequest) {
  return handlePuckPost(request, contentRepository);
}

export function PUT(request: NextRequest) {
  return handlePuckPut(request, contentRepository);
}
