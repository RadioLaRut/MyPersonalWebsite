import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  BuildReportCompatibilityError,
  createBuildReport,
  extractHtmlResourceSet,
  parseClientReferenceManifest,
  resolveChunkFile,
} from "./report-build-lib.mjs";

const ROUTE_KEY = "/(site)/page";

function makeTempRoot(t) {
  const projectRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "portfolio-build-report-"),
  );
  t.after(() => fs.rmSync(projectRoot, { force: true, recursive: true }));
  return path.join(projectRoot, ".next");
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`);
}

function clientManifestSource(manifestKey = ROUTE_KEY, manifest = {
  clientModules: {
    "[project]/src/components/layout/Navigation.tsx": {
      chunks: ["1", "static/chunks/app/home.js"],
    },
    "[project]/src/components/layout/Navigation.tsx <module evaluation>": {
      chunks: ["1", "static/chunks/app/home.js"],
    },
    "[project]/src/lib/site-mode.ts": { chunks: [] },
  },
}) {
  return (
    "globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});" +
    `globalThis.__RSC_MANIFEST[${JSON.stringify(manifestKey)}]=${JSON.stringify(manifest)};`
  );
}

function writeFixture(nextRoot, {
  clientSource = clientManifestSource(),
} = {}) {
  writeJson(path.join(nextRoot, "server", "app-paths-manifest.json"), {
    [ROUTE_KEY]: "app/(site)/page.js",
  });
  writeJson(path.join(nextRoot, "prerender-manifest.json"), {
    routes: {
      "/": {
        dataRoute: "/index.rsc",
        srcRoute: "/",
      },
    },
  });
  writeJson(path.join(nextRoot, "server", "middleware.js.nft.json"), {
    files: ["../package.json"],
  });
  const clientManifestPath = path.join(
    nextRoot,
    "server",
    "app",
    "(site)",
    "page_client-reference-manifest.js",
  );
  fs.mkdirSync(path.dirname(clientManifestPath), { recursive: true });
  fs.writeFileSync(clientManifestPath, clientSource);

  const chunkPath = path.join(nextRoot, "static", "chunks", "app", "home.js");
  fs.mkdirSync(path.dirname(chunkPath), { recursive: true });
  fs.writeFileSync(chunkPath, "console.log('fixture');\n");
  const cssPath = path.join(nextRoot, "static", "css", "home.css");
  fs.mkdirSync(path.dirname(cssPath), { recursive: true });
  fs.writeFileSync(cssPath, "body{background:#000}\n");
  const fontPath = path.join(path.dirname(nextRoot), "public", "fonts", "test.woff2");
  fs.mkdirSync(path.dirname(fontPath), { recursive: true });
  fs.writeFileSync(fontPath, "font-fixture");
  const htmlPath = path.join(nextRoot, "server", "app", "index.html");
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(
    htmlPath,
    [
      "<!doctype html><html><head>",
      '<link rel="stylesheet" href="/_next/static/css/home.css"/>',
      '<link rel="preload" as="font" href="/fonts/test.woff2" type="font/woff2"/>',
      '<link rel="preload" as="image" imagesrcset="/_next/image?url=hero"/>',
      "</head><body>",
      '<script src="/_next/static/chunks/app/home.js"></script>',
      "</body></html>",
    ].join(""),
  );
  fs.writeFileSync(
    path.join(nextRoot, "server", "app", "index.rsc"),
    "rsc fixture",
  );
}

test("current Next output fixture produces schema v4 from concrete HTML resources", (t) => {
  const nextRoot = makeTempRoot(t);
  writeFixture(nextRoot);

  const report = createBuildReport({
    generatedAt: "2026-07-23T00:00:00.000Z",
    nextRoot,
  });

  assert.equal(report.schemaVersion, 4);
  assert.equal(report.generatedAt, "2026-07-23T00:00:00.000Z");
  assert.deepEqual(report.prerenderedRoutes, ["/"]);
  assert.equal(report.routes["/"].entryChunks.length, 1);
  assert.equal(report.routes["/"].entryChunks[0].path, "static/chunks/app/home.js");
  assert.deepEqual(report.routes["/"].clientComponents, ["layout/Navigation.tsx"]);
  assert.equal(report.routes["/"].css.files.length, 1);
  assert.equal(report.routes["/"].fonts.preloadCount, 1);
  assert.equal(report.routes["/"].images.preloadCount, 1);
  assert.equal(report.routes["/"].performanceBudget.imagePreloadCount.pass, true);
  assert.equal(
    report.routes["/"].performanceBudget.toolingClientModuleCount.pass,
    true,
  );
  assert.deepEqual(report.routes["/"].toolingClientModules, []);
  assert.equal(report.budgetFailures.length, 0);
  assert.ok(report.routes["/"].rawBytes > 0);
  assert.ok(report.routes["/"].gzipBytes > 0);
});

test("公开路由引用后台控制模块时构建预算失败", (t) => {
  const nextRoot = makeTempRoot(t);
  writeFixture(nextRoot, {
    clientSource: clientManifestSource(ROUTE_KEY, {
      clientModules: {
        "[project]/src/components/layout/Navigation.tsx": {
          chunks: ["1", "static/chunks/app/home.js"],
        },
        "[project]/src/components/playground/ComponentLabClient.tsx": {
          chunks: ["1", "static/chunks/app/home.js"],
        },
      },
    }),
  });

  const report = createBuildReport({ nextRoot });
  assert.deepEqual(report.routes["/"].toolingClientModules, [
    "src/components/playground/ComponentLabClient.tsx",
  ]);
  assert.equal(
    report.routes["/"].performanceBudget.toolingClientModuleCount.pass,
    false,
  );
  assert.deepEqual(report.budgetFailures, [{
    actual: 1,
    budget: "toolingClientModuleCount",
    limit: 0,
    route: "/",
  }]);
});

test("公开图片加载协调器不属于后台控制模块", (t) => {
  const nextRoot = makeTempRoot(t);
  writeFixture(nextRoot, {
    clientSource: clientManifestSource(ROUTE_KEY, {
      clientModules: {
        "[project]/src/components/layout/Navigation.tsx": {
          chunks: ["1", "static/chunks/app/home.js"],
        },
        "[project]/src/components/layout/ImageLoadCoordinator.tsx": {
          chunks: ["1", "static/chunks/app/home.js"],
        },
      },
    }),
  });

  const report = createBuildReport({ nextRoot });
  assert.deepEqual(report.routes["/"].toolingClientModules, []);
  assert.equal(
    report.routes["/"].performanceBudget.toolingClientModuleCount.pass,
    true,
  );
  assert.equal(report.budgetFailures.length, 0);
});

test("HTML resource projection follows actual tags and ignores unrelated assets", () => {
  assert.deepEqual(
    extractHtmlResourceSet([
      '<script src="/_next/static/chunks/a.js"></script>',
      '<link as="script" rel="preload" href="/_next/static/chunks/not-executed.js"/>',
      '<link href="/_next/static/css/a.css" rel="stylesheet"/>',
      '<link href="/fonts/a.woff2" rel="preload" as="font"/>',
    ].join("")),
    {
      fontPreloads: [{ href: "/fonts/a.woff2", type: null }],
      imagePreloads: [],
      scripts: ["/_next/static/chunks/a.js"],
      styles: ["/_next/static/css/a.css"],
    },
  );
});

test("Client Reference Manifest parser rejects executable or non-JSON syntax", () => {
  for (const source of [
    "while(true){}",
    "globalThis.__RSC_MANIFEST={};globalThis.__RSC_MANIFEST[\"/x\"]={};",
    "globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});" +
      "globalThis.__RSC_MANIFEST[\"/x\"]={clientModules: {}};",
    clientManifestSource(ROUTE_KEY, {}),
  ]) {
    assert.throws(
      () => parseClientReferenceManifest(Buffer.from(source)),
      BuildReportCompatibilityError,
    );
  }
});

test("chunk path validation rejects absolute, dot-segment, and non-JavaScript paths", (t) => {
  const nextRoot = makeTempRoot(t);
  fs.mkdirSync(nextRoot, { recursive: true });

  for (const chunkPath of [
    "C:/outside.js",
    "/outside.js",
    "static/chunks/../outside.js",
    "static/chunks/app/styles.css",
    "server/app/page.js",
    "static\\chunks\\app\\page.js",
  ]) {
    assert.throws(
      () => resolveChunkFile(nextRoot, chunkPath),
      BuildReportCompatibilityError,
    );
  }
});

test("Next-encoded dynamic route brackets resolve to the literal filesystem path", (t) => {
  const nextRoot = makeTempRoot(t);
  const chunkPath = path.join(
    nextRoot,
    "static",
    "chunks",
    "app",
    "[id]",
    "page.js",
  );
  fs.mkdirSync(path.dirname(chunkPath), { recursive: true });
  fs.writeFileSync(chunkPath, "export {};\n");

  const resolved = resolveChunkFile(
    nextRoot,
    "static/chunks/app/%5Bid%5D/page.js",
  );
  assert.equal(resolved.normalizedPath, "static/chunks/app/[id]/page.js");
  assert.throws(
    () => resolveChunkFile(nextRoot, "static/chunks/app/%2e%2e/page.js"),
    /percent-encoding/u,
  );
});

test("realpath containment rejects a symlink or junction escape before reading it", (t) => {
  const nextRoot = makeTempRoot(t);
  const outsideRoot = path.join(path.dirname(nextRoot), "outside");
  const linkPath = path.join(nextRoot, "static", "chunks", "linked");
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  fs.mkdirSync(outsideRoot, { recursive: true });
  fs.writeFileSync(path.join(outsideRoot, "outside.js"), "sentinel");

  try {
    fs.symlinkSync(outsideRoot, linkPath, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "EPERM") {
      t.skip("当前 Windows 权限不允许创建测试 junction");
      return;
    }
    throw error;
  }

  assert.throws(
    () => resolveChunkFile(nextRoot, "static/chunks/linked/outside.js"),
    /resolves outside/u,
  );
});

test("manifest, per-route count, per-chunk, and per-route byte limits fail closed", (t) => {
  const nextRoot = makeTempRoot(t);
  writeFixture(nextRoot);

  assert.throws(
    () => createBuildReport({ nextRoot, limits: { manifestBytes: 8 } }),
    /exceeds/u,
  );
  assert.throws(
    () => createBuildReport({ nextRoot, limits: { chunksPerRoute: 0 } }),
    /at most 0 script chunks/u,
  );
  assert.throws(
    () => createBuildReport({ nextRoot, limits: { chunkBytes: 4 } }),
    /Asset .* exceeds/u,
  );
  assert.throws(
    () => createBuildReport({ nextRoot, limits: { routeChunkBytes: 4 } }),
    /route chunk limit/u,
  );
});

test("invalid JSON manifests and mismatched client keys produce compatibility errors", (t) => {
  const nextRoot = makeTempRoot(t);
  writeFixture(nextRoot, { clientSource: clientManifestSource("/(site)/about/page") });
  fs.writeFileSync(path.join(nextRoot, "prerender-manifest.json"), "not json");

  assert.throws(
    () => createBuildReport({ nextRoot }),
    BuildReportCompatibilityError,
  );

  writeJson(path.join(nextRoot, "prerender-manifest.json"), {
    routes: {
      "/": { dataRoute: "/index.rsc", srcRoute: "/" },
    },
  });
  assert.throws(
    () => createBuildReport({ nextRoot }),
    /key mismatch/u,
  );
});
