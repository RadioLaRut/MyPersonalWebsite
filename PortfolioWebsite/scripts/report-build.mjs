import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const nextRoot = path.resolve(process.cwd(), ".next");
const serverAppRoot = path.join(nextRoot, "server/app");

function listManifestFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listManifestFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith("_client-reference-manifest.js")
      ? [absolutePath]
      : [];
  });
}

function toPublicRoute(manifestKey) {
  const withoutPage = manifestKey.replace(/\/page$/, "");
  const withoutGroups = withoutPage.replace(/\/\([^/]+\)/g, "");
  return withoutGroups || "/";
}

function readRouteReport(manifestPath) {
  const context = { globalThis: {} };
  context.globalThis.globalThis = context.globalThis;
  vm.runInNewContext(fs.readFileSync(manifestPath, "utf8"), context);

  const manifestEntries = Object.entries(context.globalThis.__RSC_MANIFEST ?? {});
  if (manifestEntries.length !== 1) return null;
  const [manifestKey, manifest] = manifestEntries[0];
  if (!manifestKey.startsWith("/(site)/")) return null;

  const pageEntry = Object.entries(manifest.entryJSFiles)
    .filter(([entryKey]) => entryKey.endsWith("/page"))
    .sort((left, right) => right[1].length - left[1].length)[0];
  if (!pageEntry) return null;

  const entryFiles = [...new Set(pageEntry[1])];
  const entryChunks = entryFiles.map((relativePath) => {
    const content = fs.readFileSync(path.join(nextRoot, relativePath));
    return {
      gzipBytes: zlib.gzipSync(content).length,
      path: relativePath.replaceAll(path.sep, "/"),
      rawBytes: content.length,
    };
  });
  const clientComponents = [...new Set(
    Object.keys(manifest.clientModules)
      .filter((moduleName) => moduleName.includes("[project]/src/components/"))
      .map((moduleName) => moduleName
        .replace(/^.*src\/components\//, "")
        .replace(/ <module evaluation>$/, "")),
  )].sort();

  return {
    clientComponents,
    entryChunks,
    gzipBytes: entryChunks.reduce((total, chunk) => total + chunk.gzipBytes, 0),
    rawBytes: entryChunks.reduce((total, chunk) => total + chunk.rawBytes, 0),
    route: toPublicRoute(manifestKey),
  };
}

const routeReports = Object.fromEntries(
  listManifestFiles(serverAppRoot)
    .map(readRouteReport)
    .filter(Boolean)
    .sort((left, right) => left.route.localeCompare(right.route))
    .map(({ route, ...report }) => [route, report]),
);
const prerenderManifest = JSON.parse(
  fs.readFileSync(path.join(nextRoot, "prerender-manifest.json"), "utf8"),
);
const proxyTracePath = path.join(nextRoot, "server/middleware.js.nft.json");
const proxyTrace = fs.existsSync(proxyTracePath)
  ? JSON.parse(fs.readFileSync(proxyTracePath, "utf8"))
  : { files: [] };
const proxyTraceFiles = Array.isArray(proxyTrace.files) ? proxyTrace.files : [];
const tracedContentFiles = proxyTraceFiles.filter((filePath) => (
  /(^|\/)(?:content|public)\//.test(String(filePath).replaceAll("\\", "/"))
));
if (tracedContentFiles.length > 0) {
  throw new Error(
    `Proxy trace must not include runtime content or public assets: ${tracedContentFiles.slice(0, 5).join(", ")}`,
  );
}
const report = {
  generatedAt: new Date().toISOString(),
  prerenderedRoutes: Object.keys(prerenderManifest.routes).sort(),
  proxyTraceFileCount: proxyTraceFiles.length,
  routes: routeReports,
};

fs.writeFileSync(
  path.join(nextRoot, "build-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

const largestRoute = Object.entries(routeReports)
  .sort((left, right) => right[1].gzipBytes - left[1].gzipBytes)[0];
const home = routeReports["/"];
console.log(
  `Build report: ${report.prerenderedRoutes.length} prerendered routes; ` +
  `homepage JS ${home?.rawBytes ?? 0} raw / ${home?.gzipBytes ?? 0} gzip bytes; ` +
  `largest public route ${largestRoute?.[0] ?? "n/a"} ${largestRoute?.[1].gzipBytes ?? 0} gzip bytes.`,
);
