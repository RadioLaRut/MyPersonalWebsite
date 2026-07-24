import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  BuildReportCompatibilityError,
  createBuildReport,
  parseClientReferenceManifest,
  resolveChunkFile,
} from "./report-build-lib.mjs";

const ROUTE_KEY = "/(site)/page";

function makeTempRoot(t) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-build-report-"));
  t.after(() => fs.rmSync(tempRoot, { force: true, recursive: true }));
  return tempRoot;
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
  rootMainFiles = [],
} = {}) {
  writeJson(path.join(nextRoot, "server", "app-paths-manifest.json"), {
    [ROUTE_KEY]: "app/(site)/page.js",
  });
  writeJson(path.join(nextRoot, "build-manifest.json"), { rootMainFiles });
  writeJson(path.join(nextRoot, "prerender-manifest.json"), {
    routes: { "/": {} },
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
}

test("current Next manifest fixture produces schema v2 and deduplicated route chunks", (t) => {
  const nextRoot = makeTempRoot(t);
  writeFixture(nextRoot);

  const report = createBuildReport({
    generatedAt: "2026-07-23T00:00:00.000Z",
    nextRoot,
  });

  assert.equal(report.schemaVersion, 2);
  assert.equal(report.generatedAt, "2026-07-23T00:00:00.000Z");
  assert.deepEqual(report.prerenderedRoutes, ["/"]);
  assert.equal(report.routes["/"].entryChunks.length, 1);
  assert.equal(report.routes["/"].entryChunks[0].path, "static/chunks/app/home.js");
  assert.deepEqual(report.routes["/"].clientComponents, ["layout/Navigation.tsx"]);
  assert.ok(report.routes["/"].rawBytes > 0);
  assert.ok(report.routes["/"].gzipBytes > 0);
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
  const tempRoot = makeTempRoot(t);
  const nextRoot = path.join(tempRoot, ".next");
  const outsideRoot = path.join(tempRoot, "outside");
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
    /outside \.next/u,
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
    /at most 0 chunks/u,
  );
  assert.throws(
    () => createBuildReport({ nextRoot, limits: { chunkBytes: 4 } }),
    /Chunk .* exceeds/u,
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

  writeJson(path.join(nextRoot, "prerender-manifest.json"), { routes: { "/": {} } });
  assert.throws(
    () => createBuildReport({ nextRoot }),
    /key mismatch/u,
  );
});
