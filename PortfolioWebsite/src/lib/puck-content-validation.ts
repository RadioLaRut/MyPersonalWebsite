import fs from "node:fs";
import path from "node:path";

import { PUCK_COMPONENT_TYPE_SET } from "../puck/component-manifest.ts";
import { isNonEmptyString } from "./json-utils.ts";
import { isPlainRecord, normalizePuckData } from "./puck-data-normalization.ts";
import { splitPublicPathSegments } from "./public-paths.ts";
import { getCanonicalSlugSegmentIssue } from "./slug-segments.ts";

export type ContentValidationIssue = {
  filePath?: string;
  message: string;
  path: string;
};

type ValidateContentPagesOptions = {
  contentRoot: string;
  publicRoot: string;
};

export const IMAGE_LIKE_PROP_PATTERN =
  /(src|imageSrc|heroImage|coverImage|nextBg|mediaSrc|litSrc|unlitSrc|leftImage|rightImage|lit|unlit)$/i;

export const PUBLIC_IMAGE_PATH_PREFIXES = ["/images/", "/assets/images/"] as const;

export type ExactCasePathStatus = "missing" | "case-mismatch" | "ok";
export type ImageLikeReference = {
  path: string;
  value: string;
};

function makeIssue(pathName: string, message: string, filePath?: string): ContentValidationIssue {
  return {
    filePath,
    message,
    path: pathName,
  };
}

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

export function walkJsonFiles(dir: string): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

export function validateContentPageFilePath(
  jsonFilePath: string,
  contentRoot: string,
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const relativePath = toPosixPath(path.relative(contentRoot, jsonFilePath));

  if (relativePath.startsWith("../") || relativePath === ".." || path.isAbsolute(relativePath)) {
    return [makeIssue(relativePath, "content page file must stay under content/pages", jsonFilePath)];
  }

  const segments = relativePath.split("/").filter(Boolean);
  const fileName = segments.at(-1);
  if (!fileName) {
    return [makeIssue(relativePath, "content page file name is missing", jsonFilePath)];
  }

  for (const directoryName of segments.slice(0, -1)) {
    const directoryIssue = getCanonicalSlugSegmentIssue(directoryName);
    if (directoryIssue) {
      issues.push(makeIssue(relativePath, `directory "${directoryName}" ${directoryIssue}`, jsonFilePath));
    }
  }

  const extension = path.extname(fileName);
  if (extension !== ".json") {
    issues.push(makeIssue(relativePath, "file extension must be lowercase .json", jsonFilePath));
  }

  const baseName = fileName.slice(0, -extension.length);
  const fileIssue = getCanonicalSlugSegmentIssue(baseName);
  if (fileIssue) {
    issues.push(makeIssue(relativePath, `file name "${fileName}" ${fileIssue}`, jsonFilePath));
  }

  return issues;
}

function validateNodeArray(
  value: unknown,
  pathName: string,
  issues: ContentValidationIssue[],
  filePath?: string,
) {
  if (!Array.isArray(value)) {
    issues.push(makeIssue(pathName, "must be an array", filePath));
    return;
  }

  value.forEach((node, index) => {
    validatePuckNode(node, `${pathName}[${index}]`, issues, filePath);
  });
}

function validatePuckNode(
  node: unknown,
  pathName: string,
  issues: ContentValidationIssue[],
  filePath?: string,
) {
  if (!isPlainRecord(node)) {
    issues.push(makeIssue(pathName, "component node must be an object", filePath));
    return;
  }

  const { type, props } = node;
  if (!isNonEmptyString(type)) {
    issues.push(makeIssue(`${pathName}.type`, "must be a non-empty string", filePath));
  } else if (!PUCK_COMPONENT_TYPE_SET.has(type)) {
    issues.push(makeIssue(`${pathName}.type`, `unknown component type "${type}"`, filePath));
  }

  if (!isPlainRecord(props)) {
    issues.push(makeIssue(`${pathName}.props`, "must be an object", filePath));
    return;
  }

  if (!isNonEmptyString(props.id)) {
    issues.push(makeIssue(`${pathName}.props.id`, "props.id must be a non-empty string", filePath));
  }
}

function validateNormalizedPuckContentData(
  normalizedData: unknown,
  filePath?: string,
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];

  if (!isPlainRecord(normalizedData)) {
    return [makeIssue("$", "top-level content data must be an object", filePath)];
  }

  validateNodeArray(normalizedData.content, "content", issues, filePath);

  if ("zones" in normalizedData && normalizedData.zones !== undefined) {
    if (!isPlainRecord(normalizedData.zones)) {
      issues.push(makeIssue("zones", "must be a record of arrays", filePath));
    } else {
      for (const [zoneName, zoneValue] of Object.entries(normalizedData.zones)) {
        validateNodeArray(zoneValue, `zones.${zoneName}`, issues, filePath);
      }
    }
  }

  return issues;
}

export function validatePuckContentData(data: unknown, filePath?: string): ContentValidationIssue[] {
  return validateNormalizedPuckContentData(normalizePuckData(data), filePath);
}

export function collectImageLikeReferences(
  value: unknown,
  acc: ImageLikeReference[] = [],
  currentPath = "$",
) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectImageLikeReferences(entry, acc, `${currentPath}[${index}]`));
    return acc;
  }

  if (!isPlainRecord(value)) {
    return acc;
  }

  for (const [key, entry] of Object.entries(value)) {
    const nextPath = `${currentPath}.${key}`;
    if (
      typeof entry === "string" &&
      IMAGE_LIKE_PROP_PATTERN.test(key) &&
      PUBLIC_IMAGE_PATH_PREFIXES.some((prefix) => entry.startsWith(prefix))
    ) {
      acc.push({ path: nextPath, value: entry });
      continue;
    }

    collectImageLikeReferences(entry, acc, nextPath);
  }

  return acc;
}

function readDirectoryEntryNames(
  dirPath: string,
  dirEntriesCache: Map<string, Set<string>>,
) {
  const cached = dirEntriesCache.get(dirPath);
  if (cached) {
    return cached;
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }

  const names = new Set(entries.map((entry) => entry.name));
  dirEntriesCache.set(dirPath, names);
  return names;
}

export function hasExactCasePath(
  rootDir: string,
  relativePath: string,
  dirEntriesCache = new Map<string, Set<string>>(),
): ExactCasePathStatus {
  let currentPath = rootDir;
  const segments = splitPublicPathSegments(relativePath);
  if (segments === null) {
    return "missing";
  }

  for (const segment of segments) {
    const entries = readDirectoryEntryNames(currentPath, dirEntriesCache);
    if (!entries) {
      return "missing";
    }

    if (!entries.has(segment)) {
      const hasCaseInsensitiveMatch = [...entries].some(
        (entryName) => entryName.toLowerCase() === segment.toLowerCase(),
      );
      return hasCaseInsensitiveMatch ? "case-mismatch" : "missing";
    }

    currentPath = path.join(currentPath, segment);
  }

  return "ok";
}

function validatePublicImages(
  normalizedData: unknown,
  publicRoot: string,
  issues: ContentValidationIssue[],
  filePath: string,
  dirEntriesCache: Map<string, Set<string>>,
) {
  const imagePaths = collectImageLikeReferences(normalizedData);

  for (const imagePath of imagePaths) {
    const relativeImagePath = imagePath.value.replace(/^\//, "");
    const pathStatus = hasExactCasePath(publicRoot, relativeImagePath, dirEntriesCache);
    if (pathStatus === "missing") {
      issues.push(makeIssue(imagePath.path, `public image "${imagePath.value}" does not exist`, filePath));
      continue;
    }

    if (pathStatus === "case-mismatch") {
      issues.push(
        makeIssue(imagePath.path, `public image "${imagePath.value}" must match exact filesystem casing`, filePath),
      );
    }
  }
}

export function validateContentPages({
  contentRoot,
  publicRoot,
}: ValidateContentPagesOptions): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const dirEntriesCache = new Map<string, Set<string>>();

  for (const jsonFile of walkJsonFiles(contentRoot)) {
    issues.push(...validateContentPageFilePath(jsonFile, contentRoot));

    let data: unknown;
    try {
      data = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown JSON parse error";
      issues.push(makeIssue("$", `must be valid JSON: ${message}`, jsonFile));
      continue;
    }

    const normalizedData = normalizePuckData(data);
    issues.push(...validateNormalizedPuckContentData(normalizedData, jsonFile));
    validatePublicImages(normalizedData, publicRoot, issues, jsonFile, dirEntriesCache);
  }

  return issues;
}

export function formatContentValidationIssues(issues: ContentValidationIssue[]) {
  return issues.map((issue) => {
    const filePrefix = issue.filePath ? `${toPosixPath(issue.filePath)}: ` : "";
    return `${filePrefix}${issue.path}: ${issue.message}`;
  });
}
