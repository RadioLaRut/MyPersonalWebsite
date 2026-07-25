import { randomUUID } from "node:crypto";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  assertAggregateContentQuota,
  assertPageDocumentBudget,
  CONTENT_BUDGET_PROFILE_V1,
  ContentBudgetExceededError,
} from "./content-budget.ts";
import { withContentWriteQueue } from "./content-write-queue.ts";
import {
  CONTENT_PAGES_ROOT,
  type NormalizedPuckSlug,
  normalizePuckSlugInput,
  normalizePuckSlugSegment,
  toPuckRouteSegments,
} from "./puck-slug.ts";

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

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
    const stat = await fs.stat(filePath);
    if (stat.size > CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes) {
      throw new ContentBudgetExceededError(
        `Stored page exceeds ${CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes} bytes`,
      );
    }
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

async function collectPageStorageUsage(targetPath: string) {
  const directories = [CONTENT_PAGES_ROOT];
  let bytes = 0;
  let files = 0;
  let targetBytes = 0;
  let targetExists = false;

  while (directories.length > 0) {
    const directory = directories.pop();
    if (!directory) break;

    let entries: Dirent[];
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
        continue;
      }
      if (!entry.isFile() || path.extname(entry.name) !== ".json") continue;

      const stat = await fs.stat(absolutePath);
      files += 1;
      bytes += stat.size;
      if (path.resolve(absolutePath) === path.resolve(targetPath)) {
        targetBytes = stat.size;
        targetExists = true;
      }
    }
  }

  return { bytes, files, targetBytes, targetExists };
}

function assertPageStorageQuota(
  usage: Awaited<ReturnType<typeof collectPageStorageUsage>>,
  serializedBytes: number,
) {
  assertAggregateContentQuota(
    {
      bytes: usage.bytes,
      files: usage.files,
      replacedBytes: usage.targetBytes,
      replacesExisting: usage.targetExists,
    },
    serializedBytes,
    {
      maxBytes: CONTENT_BUDGET_PROFILE_V1.storage.pageBytes,
      maxFiles: CONTENT_BUDGET_PROFILE_V1.storage.pageCount,
    },
  );
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
  const stat = await fs.stat(normalizedSlug.absoluteJsonPath);
  if (stat.size > CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes) {
    throw new ContentBudgetExceededError(
      `Stored page exceeds ${CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes} bytes`,
    );
  }
  const rawFile = await fs.readFile(normalizedSlug.absoluteJsonPath, "utf8");
  return JSON.parse(rawFile) as JsonValue;
}

export async function writePageDataAtomically(rawSlug: string | string[] | undefined, data: JsonValue) {
  const normalized = normalizePuckSlugInput(rawSlug);
  await writePageDataByNormalizedSlug(normalized, data);
  return normalized;
}

export async function writePageDataByNormalizedSlug(normalizedSlug: NormalizedPuckSlug, data: JsonValue) {
  assertPageDocumentBudget(data);
  await withContentWriteQueue(async () => {
    await assertExactCaseParentPath(normalizedSlug.relativeJsonPath);
    const lineEnding = await resolvePreferredLineEnding(normalizedSlug.absoluteJsonPath);
    const serialized = `${JSON.stringify(data, null, 2).replace(/\n/g, lineEnding)}${lineEnding}`;
    const serializedBytes = Buffer.byteLength(serialized, "utf8");
    if (serializedBytes > CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes) {
      throw new ContentBudgetExceededError(
        `Serialized page exceeds ${CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes} bytes`,
      );
    }
    const usage = await collectPageStorageUsage(normalizedSlug.absoluteJsonPath);
    assertPageStorageQuota(usage, serializedBytes);

    await fs.mkdir(path.dirname(normalizedSlug.absoluteJsonPath), { recursive: true });

    const baseName = path.basename(normalizedSlug.absoluteJsonPath, ".json");
    const tmpPath = path.join(
      path.dirname(normalizedSlug.absoluteJsonPath),
      `${baseName}.${Date.now()}.${randomUUID()}.tmp.json`,
    );

    try {
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

export async function createPageDataByNormalizedSlug(
  normalizedSlug: NormalizedPuckSlug,
  data: JsonValue,
) {
  assertPageDocumentBudget(data);
  await withContentWriteQueue(async () => {
    await assertExactCaseParentPath(normalizedSlug.relativeJsonPath);
    const serialized = `${JSON.stringify(data, null, 2).replace(/\n/g, os.EOL)}${os.EOL}`;
    const serializedBytes = Buffer.byteLength(serialized, "utf8");
    if (serializedBytes > CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes) {
      throw new ContentBudgetExceededError(
        `Serialized page exceeds ${CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes} bytes`,
      );
    }

    const usage = await collectPageStorageUsage(normalizedSlug.absoluteJsonPath);
    if (usage.targetExists) {
      const conflict = new Error(
        `Content page "${normalizedSlug.slugKey}" already exists`,
      ) as NodeJS.ErrnoException;
      conflict.code = "EEXIST";
      throw conflict;
    }
    assertPageStorageQuota(usage, serializedBytes);

    await fs.mkdir(path.dirname(normalizedSlug.absoluteJsonPath), { recursive: true });
    const baseName = path.basename(normalizedSlug.absoluteJsonPath, ".json");
    const tmpPath = path.join(
      path.dirname(normalizedSlug.absoluteJsonPath),
      `${baseName}.${Date.now()}.${randomUUID()}.tmp.json`,
    );

    try {
      await fs.writeFile(tmpPath, serialized, { encoding: "utf8", flag: "wx" });
      await fs.link(tmpPath, normalizedSlug.absoluteJsonPath);
    } finally {
      await fs.unlink(tmpPath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
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
  const allSlugs = await walkJsonFiles(CONTENT_PAGES_ROOT);
  return Array.from(new Set(allSlugs)).sort();
}
