import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
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
      const relativeFilePath = path.relative(projectRoot, filePath);
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

const repoRoot = getRepoRoot();
const references = collectAssetReferences();
const missingOnDisk = [];
const missingInGit = [];

for (const [assetPath, sources] of references.entries()) {
  const absoluteAssetPath = path.join(projectRoot, "public", assetPath.replace(/^\//, ""));

  if (!existsSync(absoluteAssetPath)) {
    missingOnDisk.push({ assetPath, sources: [...sources].sort() });
    continue;
  }

  if (repoRoot && !isTrackedByGit(repoRoot, absoluteAssetPath)) {
    missingInGit.push({ assetPath, sources: [...sources].sort() });
  }
}

if (missingOnDisk.length === 0 && missingInGit.length === 0) {
  console.log("Public asset check passed.");
  process.exit(0);
}

if (missingOnDisk.length > 0) {
  console.error("以下资源路径在 public/ 中不存在：");
  for (const item of missingOnDisk) {
    console.error(`- ${item.assetPath}`);
    console.error(`  来源: ${item.sources.join(", ")}`);
  }
}

if (missingInGit.length > 0) {
  console.error("以下资源文件存在于本地，但没有被 Git 跟踪，部署到 Vercel 时会丢失：");
  for (const item of missingInGit) {
    console.error(`- ${item.assetPath}`);
    console.error(`  来源: ${item.sources.join(", ")}`);
  }
}

process.exit(1);
