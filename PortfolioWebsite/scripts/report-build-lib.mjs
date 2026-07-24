import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

export const BUILD_REPORT_LIMITS = Object.freeze({
  manifestBytes: 8 * 1024 * 1024,
  chunksPerRoute: 512,
  chunkBytes: 32 * 1024 * 1024,
  routeChunkBytes: 256 * 1024 * 1024,
});

export class BuildReportCompatibilityError extends Error {
  constructor(message) {
    super(message);
    this.name = "BuildReportCompatibilityError";
  }
}

function isPlainRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function withLimits(overrides = {}) {
  return { ...BUILD_REPORT_LIMITS, ...overrides };
}

function readFileWithLimit(filePath, maxBytes, label) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (error) {
    throw new BuildReportCompatibilityError(
      `${label} is missing or unreadable: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }

  if (!stat.isFile()) {
    throw new BuildReportCompatibilityError(`${label} must be a regular file`);
  }
  if (stat.size > maxBytes) {
    throw new BuildReportCompatibilityError(
      `${label} exceeds the ${maxBytes}-byte limit`,
    );
  }

  const content = fs.readFileSync(filePath);
  if (content.length > maxBytes) {
    throw new BuildReportCompatibilityError(
      `${label} exceeds the ${maxBytes}-byte limit`,
    );
  }
  return content;
}

export function parseJsonManifest(buffer, label = "JSON manifest") {
  let value;
  try {
    value = JSON.parse(buffer.toString("utf8"));
  } catch {
    throw new BuildReportCompatibilityError(`${label} must contain valid JSON`);
  }
  if (!isPlainRecord(value)) {
    throw new BuildReportCompatibilityError(`${label} must contain a JSON object`);
  }
  return value;
}

const CLIENT_REFERENCE_MANIFEST_PATTERN =
  /^\s*globalThis\.__RSC_MANIFEST\s*=\s*\(\s*globalThis\.__RSC_MANIFEST\s*\|\|\s*\{\s*\}\s*\)\s*;\s*globalThis\.__RSC_MANIFEST\[\s*("(?:\\.|[^"\\])*")\s*\]\s*=\s*(\{[\s\S]*\})\s*;?\s*$/u;

export function parseClientReferenceManifest(buffer, label = "Client Reference Manifest") {
  const source = buffer.toString("utf8");
  const match = CLIENT_REFERENCE_MANIFEST_PATTERN.exec(source);
  if (!match) {
    throw new BuildReportCompatibilityError(
      `${label} uses an unsupported Next.js manifest syntax`,
    );
  }

  let manifestKey;
  let manifest;
  try {
    manifestKey = JSON.parse(match[1]);
    manifest = JSON.parse(match[2]);
  } catch {
    throw new BuildReportCompatibilityError(
      `${label} assignment must use a JSON string key and JSON object value`,
    );
  }

  if (typeof manifestKey !== "string" || !isPlainRecord(manifest)) {
    throw new BuildReportCompatibilityError(`${label} has an invalid assignment shape`);
  }
  if (!isPlainRecord(manifest.clientModules)) {
    throw new BuildReportCompatibilityError(`${label} is missing clientModules`);
  }

  return { manifest, manifestKey };
}

function isContainedPath(rootPath, targetPath) {
  const relativePath = path.relative(rootPath, targetPath);
  return (
    relativePath.length > 0 &&
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

function validateChunkPath(relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.includes("\\") ||
    path.posix.isAbsolute(relativePath) ||
    path.win32.isAbsolute(relativePath)
  ) {
    throw new BuildReportCompatibilityError("Chunk paths must be forward relative paths");
  }

  const normalizedPath = relativePath
    .replaceAll(/%5B/giu, "[")
    .replaceAll(/%5D/giu, "]");
  if (normalizedPath.includes("%")) {
    throw new BuildReportCompatibilityError(
      `Unsupported percent-encoding in chunk path: ${relativePath}`,
    );
  }

  const segments = normalizedPath.split("/");
  if (
    segments.length < 3 ||
    segments[0] !== "static" ||
    segments[1] !== "chunks" ||
    segments.some((segment) => segment.length === 0 || segment === "." || segment === "..") ||
    !normalizedPath.endsWith(".js")
  ) {
    throw new BuildReportCompatibilityError(
      `Unsupported chunk path: ${relativePath}`,
    );
  }
  return normalizedPath;
}

export function resolveChunkFile(nextRoot, relativePath, limits = {}) {
  const effectiveLimits = withLimits(limits);
  const normalizedPath = validateChunkPath(relativePath);

  const rootPath = path.resolve(nextRoot);
  const resolvedPath = path.resolve(rootPath, ...normalizedPath.split("/"));
  if (!isContainedPath(rootPath, resolvedPath)) {
    throw new BuildReportCompatibilityError(`Chunk escapes .next: ${relativePath}`);
  }

  let realRoot;
  let realTarget;
  try {
    realRoot = fs.realpathSync(rootPath);
    realTarget = fs.realpathSync(resolvedPath);
  } catch (error) {
    throw new BuildReportCompatibilityError(
      `Chunk is missing or unreadable (${relativePath}): ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  if (!isContainedPath(realRoot, realTarget)) {
    throw new BuildReportCompatibilityError(`Chunk resolves outside .next: ${relativePath}`);
  }

  const content = readFileWithLimit(realTarget, effectiveLimits.chunkBytes, `Chunk ${relativePath}`);
  return { content, normalizedPath, resolvedPath: realTarget };
}

function validateManifestKey(manifestKey) {
  if (
    typeof manifestKey !== "string" ||
    !manifestKey.startsWith("/(site)/") ||
    !manifestKey.endsWith("/page") ||
    manifestKey.includes("\\") ||
    manifestKey.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    throw new BuildReportCompatibilityError(
      `Unsupported public route manifest key: ${String(manifestKey)}`,
    );
  }
}

function clientReferenceManifestPath(nextRoot, manifestKey) {
  validateManifestKey(manifestKey);
  const relativePath = `server/app/${manifestKey.slice(1)}_client-reference-manifest.js`;
  const rootPath = path.resolve(nextRoot);
  const resolvedPath = path.resolve(rootPath, ...relativePath.split("/"));
  if (!isContainedPath(rootPath, resolvedPath)) {
    throw new BuildReportCompatibilityError(
      `Client Reference Manifest escapes .next: ${manifestKey}`,
    );
  }
  return resolvedPath;
}

export function toPublicRoute(manifestKey) {
  validateManifestKey(manifestKey);
  const withoutPage = manifestKey.replace(/\/page$/u, "");
  const withoutGroups = withoutPage.replace(/\/\([^/]+\)/gu, "");
  return withoutGroups || "/";
}

function readJsonManifest(nextRoot, relativePath, limits, label) {
  const manifestPath = path.resolve(nextRoot, ...relativePath.split("/"));
  return parseJsonManifest(
    readFileWithLimit(manifestPath, limits.manifestBytes, label),
    label,
  );
}

function collectClientComponents(manifest) {
  return [...new Set(
    Object.keys(manifest.clientModules)
      .filter((moduleName) => moduleName.includes("[project]/src/components/"))
      .map((moduleName) => moduleName
        .replace(/^.*src\/components\//u, "")
        .replace(/ <module evaluation>$/u, "")),
  )].sort();
}

function collectClientChunkPaths(manifest, manifestKey) {
  const chunkPaths = [];
  for (const [moduleName, moduleEntry] of Object.entries(manifest.clientModules)) {
    if (!isPlainRecord(moduleEntry) || !Array.isArray(moduleEntry.chunks)) {
      throw new BuildReportCompatibilityError(
        `${manifestKey} client module ${moduleName} is missing chunks`,
      );
    }
    if (moduleEntry.chunks.length % 2 !== 0) {
      throw new BuildReportCompatibilityError(
        `${manifestKey} client module ${moduleName} has an unsupported chunk pair shape`,
      );
    }

    for (let index = 0; index < moduleEntry.chunks.length; index += 2) {
      const chunkId = moduleEntry.chunks[index];
      const chunkPath = moduleEntry.chunks[index + 1];
      if (
        typeof chunkId !== "string" ||
        !/^[0-9]+$/u.test(chunkId) ||
        typeof chunkPath !== "string"
      ) {
        throw new BuildReportCompatibilityError(
          `${manifestKey} client module ${moduleName} has an invalid chunk pair`,
        );
      }
      chunkPaths.push(chunkPath);
    }
  }
  return chunkPaths;
}

function readRouteReport(nextRoot, manifestKey, sharedChunkPaths, limits) {
  validateManifestKey(manifestKey);

  const clientManifestPath = clientReferenceManifestPath(nextRoot, manifestKey);
  const parsedClientManifest = parseClientReferenceManifest(
    readFileWithLimit(
      clientManifestPath,
      limits.manifestBytes,
      `Client Reference Manifest for ${manifestKey}`,
    ),
    `Client Reference Manifest for ${manifestKey}`,
  );
  if (parsedClientManifest.manifestKey !== manifestKey) {
    throw new BuildReportCompatibilityError(
      `Client Reference Manifest key mismatch for ${manifestKey}`,
    );
  }
  const chunkPaths = [...new Set([
    ...sharedChunkPaths,
    ...collectClientChunkPaths(parsedClientManifest.manifest, manifestKey),
  ].map(validateChunkPath))];
  if (chunkPaths.length > limits.chunksPerRoute) {
    throw new BuildReportCompatibilityError(
      `${manifestKey} must list at most ${limits.chunksPerRoute} chunks`,
    );
  }

  let routeRawBytes = 0;
  const entryChunks = chunkPaths.map((relativePath) => {
    const { content, normalizedPath } = resolveChunkFile(nextRoot, relativePath, limits);
    routeRawBytes += content.length;
    if (routeRawBytes > limits.routeChunkBytes) {
      throw new BuildReportCompatibilityError(
        `${manifestKey} exceeds the ${limits.routeChunkBytes}-byte route chunk limit`,
      );
    }
    return {
      gzipBytes: zlib.gzipSync(content).length,
      path: normalizedPath,
      rawBytes: content.length,
    };
  });

  return {
    clientComponents: collectClientComponents(parsedClientManifest.manifest),
    entryChunks,
    gzipBytes: entryChunks.reduce((total, chunk) => total + chunk.gzipBytes, 0),
    rawBytes: routeRawBytes,
    route: toPublicRoute(manifestKey),
  };
}

export function createBuildReport({
  generatedAt = new Date().toISOString(),
  limits: limitOverrides,
  nextRoot = path.resolve(process.cwd(), ".next"),
} = {}) {
  const limits = withLimits(limitOverrides);
  const appPathsManifest = readJsonManifest(
    nextRoot,
    "server/app-paths-manifest.json",
    limits,
    "App Paths Manifest",
  );
  const buildManifest = readJsonManifest(
    nextRoot,
    "build-manifest.json",
    limits,
    "Build Manifest",
  );
  if (
    !Array.isArray(buildManifest.rootMainFiles) ||
    buildManifest.rootMainFiles.some((chunkPath) => typeof chunkPath !== "string")
  ) {
    throw new BuildReportCompatibilityError("Build Manifest is missing rootMainFiles");
  }
  const sharedChunkPaths = [...new Set(buildManifest.rootMainFiles)];

  const routeReports = Object.fromEntries(
    Object.keys(appPathsManifest)
      .filter((manifestKey) => manifestKey.startsWith("/(site)/") && manifestKey.endsWith("/page"))
      .map((manifestKey) => readRouteReport(
        nextRoot,
        manifestKey,
        sharedChunkPaths,
        limits,
      ))
      .sort((left, right) => left.route.localeCompare(right.route))
      .map(({ route, ...report }) => [route, report]),
  );

  const prerenderManifest = readJsonManifest(
    nextRoot,
    "prerender-manifest.json",
    limits,
    "Prerender Manifest",
  );
  if (!isPlainRecord(prerenderManifest.routes)) {
    throw new BuildReportCompatibilityError("Prerender Manifest is missing routes");
  }

  const proxyTracePath = path.resolve(nextRoot, "server", "middleware.js.nft.json");
  const proxyTrace = fs.existsSync(proxyTracePath)
    ? parseJsonManifest(
      readFileWithLimit(proxyTracePath, limits.manifestBytes, "Proxy trace"),
      "Proxy trace",
    )
    : { files: [] };
  const proxyTraceFiles = Array.isArray(proxyTrace.files) ? proxyTrace.files : [];
  if (proxyTraceFiles.some((filePath) => typeof filePath !== "string")) {
    throw new BuildReportCompatibilityError("Proxy trace files must be strings");
  }
  const tracedContentFiles = proxyTraceFiles.filter((filePath) => (
    /(^|\/)(?:content|public)\//u.test(filePath.replaceAll("\\", "/"))
  ));
  if (tracedContentFiles.length > 0) {
    throw new BuildReportCompatibilityError(
      `Proxy trace must not include runtime content or public assets: ${
        tracedContentFiles.slice(0, 5).join(", ")
      }`,
    );
  }

  return {
    schemaVersion: 2,
    generatedAt,
    prerenderedRoutes: Object.keys(prerenderManifest.routes).sort(),
    proxyTraceFileCount: proxyTraceFiles.length,
    routes: routeReports,
  };
}

export function writeBuildReport(report, nextRoot = path.resolve(process.cwd(), ".next")) {
  fs.writeFileSync(
    path.join(nextRoot, "build-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
}
