import type { NextRequest } from "next/server";
import {
  handleComponentDesignGet,
  handleComponentDesignPost,
} from "@/lib/component-design-api-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleComponentDesignGet(request);
}

export async function POST(request: NextRequest) {
  return handleComponentDesignPost(request);
}
