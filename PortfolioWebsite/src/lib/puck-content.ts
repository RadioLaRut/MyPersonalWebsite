import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import {
  CONTENT_PAGES_ROOT,
  type NormalizedPuckSlug,
  normalizePuckSlugInput,
  toPuckRouteSegments,
} from "./puck-slug";

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

declare global {
  // eslint-disable-next-line no-var
  var __puckWriteQueue: Map<string, Promise<void>> | undefined;
}

const writeQueue = globalThis.__puckWriteQueue ?? new Map<string, Promise<void>>();
if (!globalThis.__puckWriteQueue) {
  globalThis.__puckWriteQueue = writeQueue;
}

async function walkJsonFiles(
  dirPath: string,
  relativeDir = "",
  results: string[] = [],
): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;

    if (entry.isDirectory()) {
      await walkJsonFiles(absolutePath, relativePath, results);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      const normalized = relativePath.replaceAll(path.sep, "/").replace(/\.json$/i, "");
      results.push(normalized.toLowerCase());
    }
  }

  return results;
}

async function enqueueWrite(slugKey: string, task: () => Promise<void>) {
  const previous = writeQueue.get(slugKey) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);
  writeQueue.set(slugKey, next);

  try {
    await next;
  } finally {
    if (writeQueue.get(slugKey) === next) {
      writeQueue.delete(slugKey);
    }
  }
}

export async function ensureContentPagesRoot() {
  await fs.mkdir(CONTENT_PAGES_ROOT, { recursive: true });
}

export async function readPageData(rawSlug: string | string[] | undefined): Promise<JsonValue> {
  const normalized = normalizePuckSlugInput(rawSlug);
  return readPageDataByNormalizedSlug(normalized);
}

export async function readPageDataByNormalizedSlug(normalizedSlug: NormalizedPuckSlug): Promise<JsonValue> {
  const rawFile = await fs.readFile(normalizedSlug.absoluteJsonPath, "utf8");
  return JSON.parse(rawFile) as JsonValue;
}

export async function writePageDataAtomically(rawSlug: string | string[] | undefined, data: JsonValue) {
  const normalized = normalizePuckSlugInput(rawSlug);
  await writePageDataByNormalizedSlug(normalized, data);
  return normalized;
}

export async function writePageDataByNormalizedSlug(normalizedSlug: NormalizedPuckSlug, data: JsonValue) {
  await enqueueWrite(normalizedSlug.slugKey, async () => {
    await fs.mkdir(path.dirname(normalizedSlug.absoluteJsonPath), { recursive: true });

    const baseName = path.basename(normalizedSlug.absoluteJsonPath, ".json");
    const tmpPath = path.join(
      path.dirname(normalizedSlug.absoluteJsonPath),
      `${baseName}.${Date.now()}.${randomUUID()}.tmp.json`,
    );

    try {
      await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      await fs.rename(tmpPath, normalizedSlug.absoluteJsonPath);
    } finally {
      await fs.unlink(tmpPath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
    }
  });
}

export async function listStaticPuckRouteParams() {
  await ensureContentPagesRoot();

  const allSlugs = await walkJsonFiles(CONTENT_PAGES_ROOT);
  const uniqueSlugs = Array.from(new Set(allSlugs)).sort();

  return uniqueSlugs.map((slugKey) => ({
    slug: toPuckRouteSegments(slugKey),
  }));
}

export async function listPageSlugs() {
  await ensureContentPagesRoot();
  const allSlugs = await walkJsonFiles(CONTENT_PAGES_ROOT);
  return Array.from(new Set(allSlugs)).sort();
}
