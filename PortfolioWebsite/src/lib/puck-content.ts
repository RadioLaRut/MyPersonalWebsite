import { randomUUID } from "node:crypto";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  CONTENT_PAGES_ROOT,
  type NormalizedPuckSlug,
  normalizePuckSlugInput,
  normalizePuckSlugSegment,
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

function toPosixRelativePath(relativePath: string) {
  return relativePath.replaceAll(path.sep, "/");
}

function canonicalizeContentSlugPath(relativePath: string) {
  const posixRelativePath = toPosixRelativePath(relativePath);
  const segments = posixRelativePath.split("/").filter((segment) => segment.length > 0);
  const canonicalPath = segments.map(normalizePuckSlugSegment).join("/");

  if (canonicalPath !== posixRelativePath) {
    throw new Error(`Content path must use canonical lowercase slug segments: ${posixRelativePath}`);
  }

  return canonicalPath;
}

async function resolvePreferredLineEnding(filePath: string) {
  try {
    const existingContent = await fs.readFile(filePath, "utf8");
    return existingContent.includes("\r\n") ? "\r\n" : "\n";
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      return os.EOL;
    }

    throw error;
  }
}

function createCaseMismatchError(relativePath: string, code: string) {
  const error = new Error(`Content path does not match filesystem case: ${relativePath}`) as NodeJS.ErrnoException;
  error.code = code;
  return error;
}

async function assertExactCasePathExists(rootDir: string, relativePath: string) {
  let currentPath = rootDir;

  for (const segment of relativePath.split("/").filter((value) => value.length > 0)) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    const exactEntry = entries.find((entry) => entry.name === segment);

    if (!exactEntry) {
      throw createCaseMismatchError(relativePath, "ENOENT");
    }

    currentPath = path.join(currentPath, exactEntry.name);
  }
}

async function assertExactCaseParentPath(relativePath: string) {
  const parentPath = path.posix.dirname(relativePath);
  if (parentPath === ".") {
    return;
  }

  let currentPath = CONTENT_PAGES_ROOT;

  for (const segment of parentPath.split("/").filter((value) => value.length > 0)) {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      const errno = error as NodeJS.ErrnoException;
      if (errno.code === "ENOENT") {
        return;
      }

      throw error;
    }

    const exactEntry = entries.find((entry) => entry.name === segment);
    if (exactEntry) {
      currentPath = path.join(currentPath, exactEntry.name);
      continue;
    }

    const caseInsensitiveEntry = entries.find((entry) => entry.name.toLowerCase() === segment.toLowerCase());
    if (caseInsensitiveEntry) {
      throw createCaseMismatchError(parentPath, "EEXIST");
    }

    return;
  }
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
      canonicalizeContentSlugPath(relativePath);
      await walkJsonFiles(absolutePath, relativePath, results);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      if (path.extname(entry.name) !== ".json") {
        throw new Error(`Content file must use a lowercase .json extension: ${toPosixRelativePath(relativePath)}`);
      }

      const normalized = canonicalizeContentSlugPath(relativePath.replace(/\.json$/, ""));
      results.push(normalized);
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
  await assertExactCasePathExists(CONTENT_PAGES_ROOT, normalizedSlug.relativeJsonPath);
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
    await assertExactCaseParentPath(normalizedSlug.relativeJsonPath);
    await fs.mkdir(path.dirname(normalizedSlug.absoluteJsonPath), { recursive: true });
    const lineEnding = await resolvePreferredLineEnding(normalizedSlug.absoluteJsonPath);

    const baseName = path.basename(normalizedSlug.absoluteJsonPath, ".json");
    const tmpPath = path.join(
      path.dirname(normalizedSlug.absoluteJsonPath),
      `${baseName}.${Date.now()}.${randomUUID()}.tmp.json`,
    );

    try {
      const serialized = `${JSON.stringify(data, null, 2).replace(/\n/g, lineEnding)}${lineEnding}`;
      await fs.writeFile(tmpPath, serialized, "utf8");
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
