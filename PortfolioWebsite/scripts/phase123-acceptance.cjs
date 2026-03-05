/* eslint-disable no-console */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { assertLocalEditorAccess } = require("../src/lib/security.ts");
const { normalizePuckSlugInput, SlugValidationError } = require("../src/lib/puck-slug.ts");
const {
  createUploadFileName,
  UploadValidationError,
  MAX_UPLOAD_BYTES,
} = require("../src/lib/upload-policy.ts");

const projectRoot = process.cwd();

function withEnv(nextEnv, run) {
  const keys = [
    "NODE_ENV",
    "NEXT_PUBLIC_ENABLE_PUCK",
    "CI",
    "VERCEL",
    "VERCEL_ENV",
    "VERCEL_URL",
    "VERCEL_GIT_PROVIDER",
    "VERCEL_GIT_COMMIT_SHA",
  ];
  const snapshot = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  for (const key of keys) {
    if (Object.hasOwn(nextEnv, key)) {
      process.env[key] = nextEnv[key];
    } else {
      delete process.env[key];
    }
  }

  try {
    run();
  } finally {
    for (const key of keys) {
      const value = snapshot[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function testGuard() {
  withEnv({ NODE_ENV: "development" }, () => {
    const denied = assertLocalEditorAccess("api");
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get("Cache-Control"), "no-store");
  });

  withEnv({ NODE_ENV: "development", NEXT_PUBLIC_ENABLE_PUCK: "true", CI: "1" }, () => {
    const denied = assertLocalEditorAccess("api");
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get("Cache-Control"), "no-store");
  });

  withEnv({ NODE_ENV: "development", NEXT_PUBLIC_ENABLE_PUCK: "true" }, () => {
    const allowedApi = assertLocalEditorAccess("api");
    assert.equal(allowedApi, undefined);
    assert.equal(assertLocalEditorAccess("page"), undefined);
  });

  const adminFile = fs.readFileSync(
    path.join(projectRoot, "src/app/admin/[[...puckPath]]/page.tsx"),
    "utf8",
  );
  const apiPuckFile = fs.readFileSync(path.join(projectRoot, "src/app/api/puck/route.ts"), "utf8");
  const apiUploadFile = fs.readFileSync(path.join(projectRoot, "src/app/api/upload/route.ts"), "utf8");

  assert.match(adminFile, /assertLocalEditorAccess\("page"\)/);
  assert.match(apiPuckFile, /assertLocalEditorAccess\("api"\)/);
  assert.match(apiUploadFile, /assertLocalEditorAccess\("api"\)/);
}

function testSlugCases() {
  const validCases = [
    { input: undefined, expected: "index.json" },
    { input: "", expected: "index.json" },
    { input: "/", expected: "index.json" },
    { input: "/p", expected: "index.json" },
    { input: "/p/", expected: "index.json" },
    { input: "/p/A", expected: "a.json" },
    { input: "/p/a/b", expected: "a/b.json" },
    { input: "/p//A//B//", expected: "a/b.json" },
    { input: ["A", "B"], expected: "a/b.json" },
    { input: "lighting-portfolio", expected: "lighting-portfolio.json" },
  ];

  for (const testCase of validCases) {
    const normalized = normalizePuckSlugInput(testCase.input);
    assert.equal(
      normalized.relativeJsonPath,
      testCase.expected,
      `Expected ${String(testCase.input)} -> ${testCase.expected}`,
    );
  }

  const invalidCases = [
    "/p/%2e%2e/secret",
    "/p/a/../secret",
    "/p/a\\b",
    "/p/a/%2F",
    "/p/%ZZ",
  ];

  for (const invalidInput of invalidCases) {
    assert.throws(
      () => normalizePuckSlugInput(invalidInput),
      (error) => error instanceof SlugValidationError,
      `Expected invalid slug for ${invalidInput}`,
    );
  }
}

function testPConsumerAndAtomicWriteContract() {
  const pConsumerFile = fs.readFileSync(
    path.join(projectRoot, "src/app/p/[[...slug]]/page.tsx"),
    "utf8",
  );
  const puckContentFile = fs.readFileSync(path.join(projectRoot, "src/lib/puck-content.ts"), "utf8");

  assert.match(pConsumerFile, /fs\.readFile/);
  assert.match(pConsumerFile, /JSON\.parse/);
  assert.match(pConsumerFile, /notFound\(\)/);
  assert.doesNotMatch(pConsumerFile, /from\s+["'][^"']+\.json["']/);

  assert.match(puckContentFile, /__puckWriteQueue/);
  assert.match(puckContentFile, /fs\.rename/);
  assert.match(puckContentFile, /\.tmp\.json/);
  assert.match(puckContentFile, /fs\.unlink/);
}

function testUploadPolicy() {
  const okName = createUploadFileName("image.png", "image/png", 1024);
  assert.match(okName, /\.png$/);

  assert.throws(
    () => createUploadFileName("../escape.png", "image/png", 1024),
    (error) => error instanceof UploadValidationError && error.code === "BAD_REQUEST",
  );

  assert.throws(
    () => createUploadFileName("evil.svg", "image/svg+xml", 1024),
    (error) => error instanceof UploadValidationError && error.code === "UNSUPPORTED_MEDIA_TYPE",
  );

  assert.throws(
    () => createUploadFileName("oversize.jpg", "image/jpeg", MAX_UPLOAD_BYTES + 1),
    (error) => error instanceof UploadValidationError && error.code === "PAYLOAD_TOO_LARGE",
  );
}

function testRequiredFilesExist() {
  assert.ok(fs.existsSync(path.join(projectRoot, "content/pages/index.json")));
  assert.ok(fs.existsSync(path.join(projectRoot, "content/pages/works/lighting-portfolio.json")));
  assert.ok(fs.existsSync(path.join(projectRoot, "public/puck-preview.css")));
}

function main() {
  testGuard();
  testSlugCases();
  testPConsumerAndAtomicWriteContract();
  testUploadPolicy();
  testRequiredFilesExist();
  console.log("phase123-acceptance: PASS");
}

main();
