import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const contentPagesRoot = path.join(projectRoot, "content", "pages");
const publicRoot = path.join(projectRoot, "public");
const assetReferencePattern = /(["'])(\/(?:images|assets\/images)\/[^"'`\s]+)\1/g;
const scanRoots = [
  path.join(projectRoot, "content"),
  path.join(projectRoot, "src"),
];
const allowedExtensions = new Set([".json", ".ts", ".tsx", ".js", ".jsx"]);
const excludedPathSegments = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}route-backups${path.sep}`,
];
const CANONICAL_SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WINDOWS_RESERVED_FILE_NAME_PATTERN = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function splitPublicPath(assetPath) {
  return assetPath.replace(/^\//, "").split("/").filter(Boolean);
}

function getRepoRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function isIgnoredPath(filePath) {
  return excludedPathSegments.some((segment) => filePath.includes(segment));
}

function collectFiles(rootDir) {
  if (!existsSync(rootDir)) {
    return [];
  }

  const files = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);
    if (isIgnoredPath(absolutePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...collectFiles(absolutePath));
      continue;
    }

    if (!allowedExtensions.has(path.extname(entry.name))) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function collectAssetReferences() {
  const references = new Map();

  for (const rootDir of scanRoots) {
    for (const filePath of collectFiles(rootDir)) {
      const relativeFilePath = toPosixPath(path.relative(projectRoot, filePath));
      const content = readFileSync(filePath, "utf8");

      for (const match of content.matchAll(assetReferencePattern)) {
        const assetPath = match[2];
        const sources = references.get(assetPath) ?? new Set();
        sources.add(relativeFilePath);
        references.set(assetPath, sources);
      }
    }
  }

  return references;
}

function isTrackedByGit(repoRoot, absoluteAssetPath) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", "--", path.relative(repoRoot, absoluteAssetPath)], {
      cwd: repoRoot,
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function hasExactCasePath(rootDir, relativePath) {
  let currentPath = rootDir;

  for (const segment of relativePath.split("/").filter(Boolean)) {
    const entries = readdirSync(currentPath, { withFileTypes: true });
    const exactEntry = entries.find((entry) => entry.name === segment);
    if (!exactEntry) {
      return false;
    }

    currentPath = path.join(currentPath, exactEntry.name);
  }

  return true;
}

function validateCanonicalSlugSegment(segment) {
  const normalized = segment.trim().toLowerCase();

  if (!normalized) {
    return "must not be empty";
  }

  if (normalized === "." || normalized === "..") {
    return 'must not be "." or ".."';
  }

  if (!CANONICAL_SLUG_SEGMENT_PATTERN.test(normalized)) {
    return "must use lowercase letters, numbers, and hyphens only";
  }

  if (WINDOWS_RESERVED_FILE_NAME_PATTERN.test(normalized)) {
    return "must not use a Windows reserved file name";
  }

  if (normalized !== segment) {
    return "must already use canonical lowercase slug casing";
  }

  return null;
}

function collectContentPathIssues(rootDir, relativeDir = "") {
  if (!existsSync(rootDir)) {
    return [];
  }

  const issues = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);
    const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const directoryIssue = validateCanonicalSlugSegment(entry.name);
      if (directoryIssue) {
        issues.push(`${relativePath}: directory ${directoryIssue}`);
      }

      issues.push(...collectContentPathIssues(absolutePath, relativePath));
      continue;
    }

    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".json")) {
      continue;
    }

    if (path.extname(entry.name) !== ".json") {
      issues.push(`${relativePath}: file extension must be lowercase .json`);
    }

    const baseName = entry.name.slice(0, -path.extname(entry.name).length);
    const fileIssue = validateCanonicalSlugSegment(baseName);
    if (fileIssue) {
      issues.push(`${relativePath}: file name ${fileIssue}`);
    }
  }

  return issues;
}

const repoRoot = getRepoRoot();
const references = collectAssetReferences();
const contentPathIssues = collectContentPathIssues(contentPagesRoot);
const missingOnDisk = [];
const caseMismatches = [];
const missingInGit = [];

for (const [assetPath, sources] of references.entries()) {
  const relativeAssetPath = splitPublicPath(assetPath).join("/");
  const absoluteAssetPath = path.join(publicRoot, ...splitPublicPath(assetPath));

  if (!existsSync(absoluteAssetPath)) {
    missingOnDisk.push({ assetPath, sources: [...sources].sort() });
    continue;
  }

  if (!hasExactCasePath(publicRoot, relativeAssetPath)) {
    caseMismatches.push({ assetPath, sources: [...sources].sort() });
    continue;
  }

  if (repoRoot && !isTrackedByGit(repoRoot, absoluteAssetPath)) {
    missingInGit.push({ assetPath, sources: [...sources].sort() });
  }
}

if (
  contentPathIssues.length === 0 &&
  missingOnDisk.length === 0 &&
  caseMismatches.length === 0 &&
  missingInGit.length === 0
) {
  console.log("Public asset check passed.");
  process.exit(0);
}

if (contentPathIssues.length > 0) {
  console.error("The following content page paths are not canonical across macOS and Windows:");
  for (const issue of contentPathIssues) {
    console.error(`- ${issue}`);
  }
}

if (missingOnDisk.length > 0) {
  console.error("The following asset paths do not exist under public/:");
  for (const item of missingOnDisk) {
    console.error(`- ${item.assetPath}`);
    console.error(`  Sources: ${item.sources.join(", ")}`);
  }
}

if (caseMismatches.length > 0) {
  console.error("The following asset paths exist locally but do not match the exact filesystem casing:");
  for (const item of caseMismatches) {
    console.error(`- ${item.assetPath}`);
    console.error(`  Sources: ${item.sources.join(", ")}`);
  }
}

if (missingInGit.length > 0) {
  console.error("The following asset files exist locally but are not tracked by Git:");
  for (const item of missingInGit) {
    console.error(`- ${item.assetPath}`);
    console.error(`  Sources: ${item.sources.join(", ")}`);
  }
}

process.exit(1);
