import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

export const BUILD_REPORT_LIMITS = Object.freeze({
  assetBytes: 64 * 1024 * 1024,
  chunksPerRoute: 512,
  chunkBytes: 32 * 1024 * 1024,
  manifestBytes: 8 * 1024 * 1024,
  routeChunkBytes: 256 * 1024 * 1024,
});

export const PUBLIC_PERFORMANCE_BUDGETS = Object.freeze({
  fontPreloadBytes: 2.5 * 1024 * 1024,
  fontPreloadCount: 4,
  imagePreloadCount: 1,
  toolingClientModuleCount: 0,
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
      `${label} is missing or unreadable: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
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

export function parseClientReferenceManifest(
  buffer,
  label = "Client Reference Manifest",
) {
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
  if (
    typeof manifestKey !== "string" ||
    !isPlainRecord(manifest) ||
    !isPlainRecord(manifest.clientModules)
  ) {
    throw new BuildReportCompatibilityError(`${label} has an invalid assignment shape`);
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

function normalizeEncodedBrackets(relativePath) {
  const normalizedPath = relativePath
    .replaceAll(/%5B/giu, "[")
    .replaceAll(/%5D/giu, "]");
  if (normalizedPath.includes("%")) {
    throw new BuildReportCompatibilityError(
      `Unsupported percent-encoding in asset path: ${relativePath}`,
    );
  }
  return normalizedPath;
}

function validateNextAssetPath(relativePath, extensions) {
  if (
    typeof relativePath !== "string" ||
    relativePath.includes("\\") ||
    path.posix.isAbsolute(relativePath) ||
    path.win32.isAbsolute(relativePath)
  ) {
    throw new BuildReportCompatibilityError(
      "Next asset paths must be forward relative paths",
    );
  }
  const normalizedPath = normalizeEncodedBrackets(relativePath);
  const segments = normalizedPath.split("/");
  if (
    segments.length < 3 ||
    segments[0] !== "static" ||
    segments.some(
      (segment) =>
        segment.length === 0 || segment === "." || segment === "..",
    ) ||
    !extensions.some((extension) => normalizedPath.endsWith(extension))
  ) {
    throw new BuildReportCompatibilityError(
      `Unsupported Next asset path: ${relativePath}`,
    );
  }
  return normalizedPath;
}

function resolveContainedFile(rootPath, relativePath, maxBytes, label) {
  const absoluteRoot = path.resolve(rootPath);
  const resolvedPath = path.resolve(
    absoluteRoot,
    ...relativePath.split("/"),
  );
  if (!isContainedPath(absoluteRoot, resolvedPath)) {
    throw new BuildReportCompatibilityError(`${label} escapes its root`);
  }

  let realRoot;
  let realTarget;
  try {
    realRoot = fs.realpathSync(absoluteRoot);
    realTarget = fs.realpathSync(resolvedPath);
  } catch (error) {
    throw new BuildReportCompatibilityError(
      `${label} is missing or unreadable: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  if (!isContainedPath(realRoot, realTarget)) {
    throw new BuildReportCompatibilityError(`${label} resolves outside its root`);
  }
  return {
    content: readFileWithLimit(realTarget, maxBytes, label),
    resolvedPath: realTarget,
  };
}

export function resolveChunkFile(nextRoot, relativePath, limits = {}) {
  const effectiveLimits = withLimits(limits);
  const normalizedPath = validateNextAssetPath(relativePath, [".js"]);
  const result = resolveContainedFile(
    nextRoot,
    normalizedPath,
    effectiveLimits.chunkBytes,
    `Chunk ${relativePath}`,
  );
  return { ...result, normalizedPath };
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
  const relativePath =
    `server/app/${manifestKey.slice(1)}_client-reference-manifest.js`;
  return path.resolve(nextRoot, ...relativePath.split("/"));
}

export function toPublicRoute(manifestKey) {
  validateManifestKey(manifestKey);
  const withoutPage = manifestKey.replace(/\/page$/u, "");
  const withoutGroups = withoutPage.replace(/\/\([^/]+\)/gu, "");
  return withoutGroups || "/";
}

function readJsonManifest(nextRoot, relativePath, limits, label) {
  return parseJsonManifest(
    readFileWithLimit(
      path.resolve(nextRoot, ...relativePath.split("/")),
      limits.manifestBytes,
      label,
    ),
    label,
  );
}

function parseTagAttributes(tag) {
  const attributes = {};
  const pattern =
    /([A-Za-z_:][A-Za-z0-9_:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu;
  for (const match of tag.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] =
      match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

export function extractHtmlResourceSet(html) {
  const scripts = [];
  const styles = [];
  const fontPreloads = [];
  const imagePreloads = [];

  for (const match of html.matchAll(/<script\b[^>]*>/giu)) {
    const attributes = parseTagAttributes(match[0]);
    if (attributes.src) scripts.push(attributes.src);
  }
  for (const match of html.matchAll(/<link\b[^>]*>/giu)) {
    const attributes = parseTagAttributes(match[0]);
    const relation = attributes.rel?.toLowerCase();
    const assetType = attributes.as?.toLowerCase();
    if (relation === "stylesheet" && attributes.href) {
      styles.push(attributes.href);
    } else if (relation === "preload" && assetType === "font" && attributes.href) {
      fontPreloads.push({
        href: attributes.href,
        type: attributes.type ?? null,
      });
    } else if (relation === "preload" && assetType === "image") {
      imagePreloads.push({
        href: attributes.href ?? null,
        imageSizes: attributes.imagesizes ?? null,
        imageSrcSet: attributes.imagesrcset ?? null,
      });
    }
  }

  const uniqueByJson = (items) => [
    ...new Map(items.map((item) => [JSON.stringify(item), item])).values(),
  ];
  return {
    fontPreloads: uniqueByJson(fontPreloads),
    imagePreloads: uniqueByJson(imagePreloads),
    scripts: [...new Set(scripts)],
    styles: [...new Set(styles)],
  };
}

function toNextRelativeAssetPath(url, extensions) {
  const pathname = url.split(/[?#]/u, 1)[0];
  if (!pathname.startsWith("/_next/")) {
    throw new BuildReportCompatibilityError(`Unsupported Next asset URL: ${url}`);
  }
  return validateNextAssetPath(pathname.slice("/_next/".length), extensions);
}

function summarizeBuffer(buffer, resourcePath) {
  return {
    gzipBytes: zlib.gzipSync(buffer).length,
    path: resourcePath,
    rawBytes: buffer.length,
  };
}

function summarizeNextAssets(nextRoot, urls, extensions, limits) {
  return [...new Set(urls)].map((url) => {
    const relativePath = toNextRelativeAssetPath(url, extensions);
    const maxBytes = extensions.includes(".js")
      ? limits.chunkBytes
      : limits.assetBytes;
    const { content } = resolveContainedFile(
      nextRoot,
      relativePath,
      maxBytes,
      `Asset ${url}`,
    );
    return summarizeBuffer(content, relativePath);
  });
}

function summarizeFontPreloads(nextRoot, fontPreloads, limits) {
  const projectRoot = path.dirname(path.resolve(nextRoot));
  return fontPreloads.map((font) => {
    let root;
    let relativePath;
    if (font.href.startsWith("/_next/")) {
      root = nextRoot;
      relativePath = validateNextAssetPath(
        font.href.slice("/_next/".length),
        [".otf", ".ttf", ".woff", ".woff2"],
      );
    } else if (font.href.startsWith("/fonts/")) {
      root = path.join(projectRoot, "public");
      relativePath = font.href.slice(1);
      if (
        relativePath.includes("\\") ||
        relativePath.split("/").some(
          (segment) =>
            segment.length === 0 || segment === "." || segment === "..",
        ) ||
        !/\.(?:otf|ttf|woff2?)$/iu.test(relativePath)
      ) {
        throw new BuildReportCompatibilityError(
          `Unsupported public font URL: ${font.href}`,
        );
      }
    } else {
      throw new BuildReportCompatibilityError(
        `Unsupported font preload URL: ${font.href}`,
      );
    }
    const { content } = resolveContainedFile(
      root,
      relativePath,
      limits.assetBytes,
      `Font ${font.href}`,
    );
    return {
      ...summarizeBuffer(content, relativePath),
      href: font.href,
      type: font.type,
    };
  });
}

function collectModuleChunkPaths(manifest, manifestKey) {
  const pathsByModule = new Map();
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

    const chunkPaths = [];
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
      chunkPaths.push(validateNextAssetPath(chunkPath, [".js"]));
    }
    pathsByModule.set(moduleName, chunkPaths);
  }
  return pathsByModule;
}

function collectInitialClientComponents(manifest, manifestKey, initialChunkPaths) {
  const chunks = new Set(initialChunkPaths);
  const pathsByModule = collectModuleChunkPaths(manifest, manifestKey);
  return [...new Set(
    [...pathsByModule.entries()]
      .filter(([moduleName, moduleChunks]) => (
        /[/\\]src[/\\]components[/\\]/u.test(moduleName) &&
        moduleChunks.some((chunkPath) => chunks.has(chunkPath))
      ))
      .map(([moduleName]) => moduleName
        .replace(/^.*[/\\]src[/\\]components[/\\]/u, "")
        .replace(/ <module evaluation>$/u, "")
        .replaceAll("\\", "/")),
  )].sort();
}

const PUBLIC_TOOLING_CLIENT_MODULE_PATTERNS = [
  /[/\\]src[/\\]app[/\\]\(tools\)[/\\]/u,
  /[/\\]src[/\\]components[/\\]playground[/\\]/u,
  /[/\\]src[/\\]puck[/\\]editor[/\\]/u,
  /[/\\]node_modules[/\\]@puckeditor[/\\]/u,
  /[/\\]src[/\\]components[/\\]layout[/\\](?:ComponentDesignProvider|FontLabGlobalVars)\.tsx/u,
];

function collectInitialToolingClientModules(
  manifest,
  manifestKey,
  initialChunkPaths,
) {
  const chunks = new Set(initialChunkPaths);
  const pathsByModule = collectModuleChunkPaths(manifest, manifestKey);

  return [...new Set(
    [...pathsByModule.entries()]
      .filter(([moduleName, moduleChunks]) => (
        PUBLIC_TOOLING_CLIENT_MODULE_PATTERNS.some((pattern) =>
          pattern.test(moduleName)) &&
        moduleChunks.some((chunkPath) => chunks.has(chunkPath))
      ))
      .map(([moduleName]) => moduleName
        .replace(/ <module evaluation>$/u, "")
        .replace(/^.*[/\\]src[/\\]/u, "src/")
        .replace(/^.*[/\\]node_modules[/\\]/u, "node_modules/")
        .replaceAll("\\", "/")),
  )].sort();
}

function routeStemFromDataRoute(dataRoute) {
  if (
    typeof dataRoute !== "string" ||
    !dataRoute.startsWith("/") ||
    !dataRoute.endsWith(".rsc")
  ) {
    throw new BuildReportCompatibilityError(
      `Public prerender route has an invalid dataRoute: ${String(dataRoute)}`,
    );
  }
  const stem = dataRoute.slice(1, -".rsc".length);
  if (
    stem.includes("\\") ||
    stem.split("/").some(
      (segment) =>
        segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    throw new BuildReportCompatibilityError(
      `Public prerender dataRoute is unsafe: ${dataRoute}`,
    );
  }
  return stem;
}

function readClientManifest(nextRoot, manifestKey, limits) {
  const label = `Client Reference Manifest for ${manifestKey}`;
  const parsed = parseClientReferenceManifest(
    readFileWithLimit(
      clientReferenceManifestPath(nextRoot, manifestKey),
      limits.manifestBytes,
      label,
    ),
    label,
  );
  if (parsed.manifestKey !== manifestKey) {
    throw new BuildReportCompatibilityError(
      `Client Reference Manifest key mismatch for ${manifestKey}`,
    );
  }
  return parsed.manifest;
}

function addSummaries(summaries, key) {
  return summaries.reduce((total, summary) => total + summary[key], 0);
}

function readConcreteRouteReport({
  concreteRoute,
  manifest,
  manifestKey,
  nextRoot,
  prerenderEntry,
  limits,
}) {
  const stem = routeStemFromDataRoute(prerenderEntry.dataRoute);
  const htmlBuffer = readFileWithLimit(
    path.join(nextRoot, "server", "app", `${stem}.html`),
    limits.assetBytes,
    `HTML for ${concreteRoute}`,
  );
  const rscBuffer = readFileWithLimit(
    path.join(nextRoot, "server", "app", `${stem}.rsc`),
    limits.assetBytes,
    `RSC for ${concreteRoute}`,
  );
  const htmlResources = extractHtmlResourceSet(htmlBuffer.toString("utf8"));
  const scripts = summarizeNextAssets(
    nextRoot,
    htmlResources.scripts.filter((url) => url.endsWith(".js")),
    [".js"],
    limits,
  );
  if (scripts.length > limits.chunksPerRoute) {
    throw new BuildReportCompatibilityError(
      `${concreteRoute} must list at most ${limits.chunksPerRoute} script chunks`,
    );
  }
  const scriptRawBytes = addSummaries(scripts, "rawBytes");
  if (scriptRawBytes > limits.routeChunkBytes) {
    throw new BuildReportCompatibilityError(
      `${concreteRoute} exceeds the ${limits.routeChunkBytes}-byte route chunk limit`,
    );
  }
  const styles = summarizeNextAssets(
    nextRoot,
    htmlResources.styles,
    [".css"],
    limits,
  );
  const fontPreloads = summarizeFontPreloads(
    nextRoot,
    htmlResources.fontPreloads,
    limits,
  );
  const html = summarizeBuffer(htmlBuffer, `server/app/${stem}.html`);
  const rsc = summarizeBuffer(rscBuffer, `server/app/${stem}.rsc`);
  const fontPreloadBytes = addSummaries(fontPreloads, "rawBytes");
  const jsGzipBytes = addSummaries(scripts, "gzipBytes");
  const cssGzipBytes = addSummaries(styles, "gzipBytes");
  const nonFontInitialGzipBytes =
    html.gzipBytes + jsGzipBytes + cssGzipBytes;
  const initialGzipBytes =
    nonFontInitialGzipBytes + addSummaries(fontPreloads, "gzipBytes");
  const initialChunkPaths = scripts.map((script) => script.path);
  const clientComponents = collectInitialClientComponents(
    manifest,
    manifestKey,
    initialChunkPaths,
  );
  const toolingClientModules = collectInitialToolingClientModules(
    manifest,
    manifestKey,
    initialChunkPaths,
  );

  return {
    clientComponents,
    css: {
      files: styles,
      gzipBytes: cssGzipBytes,
      rawBytes: addSummaries(styles, "rawBytes"),
    },
    entryChunks: scripts,
    fonts: {
      files: fontPreloads,
      preloadBytes: fontPreloadBytes,
      preloadCount: fontPreloads.length,
    },
    gzipBytes: jsGzipBytes,
    html,
    images: {
      preloadCount: htmlResources.imagePreloads.length,
      preloads: htmlResources.imagePreloads,
    },
    initial: {
      gzipBytes: initialGzipBytes,
      nonFontGzipBytes: nonFontInitialGzipBytes,
    },
    js: {
      files: scripts,
      gzipBytes: jsGzipBytes,
      rawBytes: scriptRawBytes,
    },
    performanceBudget: {
      fontPreloadBytes: {
        actual: fontPreloadBytes,
        limit: PUBLIC_PERFORMANCE_BUDGETS.fontPreloadBytes,
        pass: fontPreloadBytes <= PUBLIC_PERFORMANCE_BUDGETS.fontPreloadBytes,
      },
      fontPreloadCount: {
        actual: fontPreloads.length,
        limit: PUBLIC_PERFORMANCE_BUDGETS.fontPreloadCount,
        pass: fontPreloads.length <= PUBLIC_PERFORMANCE_BUDGETS.fontPreloadCount,
      },
      imagePreloadCount: {
        actual: htmlResources.imagePreloads.length,
        limit: PUBLIC_PERFORMANCE_BUDGETS.imagePreloadCount,
        pass:
          htmlResources.imagePreloads.length <=
          PUBLIC_PERFORMANCE_BUDGETS.imagePreloadCount,
      },
      toolingClientModuleCount: {
        actual: toolingClientModules.length,
        limit: PUBLIC_PERFORMANCE_BUDGETS.toolingClientModuleCount,
        pass:
          toolingClientModules.length <=
          PUBLIC_PERFORMANCE_BUDGETS.toolingClientModuleCount,
      },
    },
    rawBytes: scriptRawBytes,
    routePattern: toPublicRoute(manifestKey),
    rsc,
    toolingClientModules,
  };
}

function assertProxyTraceDoesNotShipContent(nextRoot, limits) {
  const proxyTracePath = path.resolve(
    nextRoot,
    "server",
    "middleware.js.nft.json",
  );
  const proxyTrace = fs.existsSync(proxyTracePath)
    ? parseJsonManifest(
      readFileWithLimit(
        proxyTracePath,
        limits.manifestBytes,
        "Proxy trace",
      ),
      "Proxy trace",
    )
    : { files: [] };
  const files = Array.isArray(proxyTrace.files) ? proxyTrace.files : [];
  if (files.some((filePath) => typeof filePath !== "string")) {
    throw new BuildReportCompatibilityError("Proxy trace files must be strings");
  }
  const tracedContentFiles = files.filter((filePath) =>
    /(^|\/)(?:content|public)\//u.test(filePath.replaceAll("\\", "/")),
  );
  if (tracedContentFiles.length > 0) {
    throw new BuildReportCompatibilityError(
      `Proxy trace must not include runtime content or public assets: ${
        tracedContentFiles.slice(0, 5).join(", ")
      }`,
    );
  }
  return files.length;
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
  const prerenderManifest = readJsonManifest(
    nextRoot,
    "prerender-manifest.json",
    limits,
    "Prerender Manifest",
  );
  if (!isPlainRecord(prerenderManifest.routes)) {
    throw new BuildReportCompatibilityError(
      "Prerender Manifest is missing routes",
    );
  }

  const sourceRouteToManifestKey = new Map(
    Object.keys(appPathsManifest)
      .filter(
        (manifestKey) =>
          manifestKey.startsWith("/(site)/") &&
          manifestKey.endsWith("/page"),
      )
      .map((manifestKey) => [toPublicRoute(manifestKey), manifestKey]),
  );
  const manifestCache = new Map();
  const routeReports = {};

  for (const [concreteRoute, prerenderEntry] of Object.entries(
    prerenderManifest.routes,
  ).sort(([left], [right]) => left.localeCompare(right))) {
    if (!isPlainRecord(prerenderEntry)) continue;
    const sourceRoute =
      typeof prerenderEntry.srcRoute === "string"
        ? prerenderEntry.srcRoute
        : concreteRoute;
    const manifestKey = sourceRouteToManifestKey.get(sourceRoute);
    if (!manifestKey || prerenderEntry.dataRoute === null) continue;
    let manifest = manifestCache.get(manifestKey);
    if (!manifest) {
      manifest = readClientManifest(nextRoot, manifestKey, limits);
      manifestCache.set(manifestKey, manifest);
    }
    routeReports[concreteRoute] = readConcreteRouteReport({
      concreteRoute,
      manifest,
      manifestKey,
      nextRoot,
      prerenderEntry,
      limits,
    });
  }

  const budgetFailures = Object.entries(routeReports).flatMap(
    ([route, report]) =>
      Object.entries(report.performanceBudget)
        .filter(([, result]) => !result.pass)
        .map(([budget, result]) => ({
          actual: result.actual,
          budget,
          limit: result.limit,
          route,
        })),
  );

  return {
    budgetFailures,
    generatedAt,
    prerenderedRoutes: Object.keys(prerenderManifest.routes).sort(),
    proxyTraceFileCount: assertProxyTraceDoesNotShipContent(nextRoot, limits),
    routes: routeReports,
    schemaVersion: 4,
  };
}

export function writeBuildReport(
  report,
  nextRoot = path.resolve(process.cwd(), ".next"),
) {
  fs.writeFileSync(
    path.join(nextRoot, "build-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
}
