import assert from "node:assert/strict";
import test from "node:test";

import { normalizePuckSlugInput, SlugValidationError } from "./puck-slug.ts";

type ValidCase = {
  expectedRelativePath: string;
  expectedSlugKey: string;
  input: string | string[] | undefined;
  name: string;
};

type InvalidCase = {
  input: string | string[];
  name: string;
};

const validCases: ValidCase[] = [
  {
    expectedRelativePath: "index.json",
    expectedSlugKey: "index",
    input: undefined,
    name: "undefined maps to index",
  },
  {
    expectedRelativePath: "index.json",
    expectedSlugKey: "index",
    input: "",
    name: "empty string maps to index",
  },
  {
    expectedRelativePath: "index.json",
    expectedSlugKey: "index",
    input: "/",
    name: "root path maps to index",
  },
  {
    expectedRelativePath: "index.json",
    expectedSlugKey: "index",
    input: "/p",
    name: "/p maps to index",
  },
  {
    expectedRelativePath: "index.json",
    expectedSlugKey: "index",
    input: "/p/",
    name: "/p/ maps to index",
  },
  {
    expectedRelativePath: "lighting-portfolio.json",
    expectedSlugKey: "lighting-portfolio",
    input: "/P/Lighting-Portfolio",
    name: "normalizes prefix and segment case to lowercase",
  },
  {
    expectedRelativePath: "a/b.json",
    expectedSlugKey: "a/b",
    input: "/p/a/b",
    name: "keeps regular multi-level slug mapping",
  },
  {
    expectedRelativePath: "a/b.json",
    expectedSlugKey: "a/b",
    input: "/p//A//B//",
    name: "merges repeated slashes before segment normalization",
  },
  {
    expectedRelativePath: "a/b.json",
    expectedSlugKey: "a/b",
    input: ["A", "B"],
    name: "normalizes array input",
  },
  {
    expectedRelativePath: "works/penguin.json",
    expectedSlugKey: "works/penguin",
    input: "/works/penguin",
    name: "keeps public works path mapping",
  },
  {
    expectedRelativePath: "works/lighting-portfolio/collection-1.json",
    expectedSlugKey: "works/lighting-portfolio/collection-1",
    input: "/works/lighting-portfolio/collection-1",
    name: "keeps nested public lighting collection path mapping",
  },
  {
    expectedRelativePath: "lighting-portfolio.json",
    expectedSlugKey: "lighting-portfolio",
    input: "lighting-portfolio",
    name: "keeps plain slug without /p prefix",
  },
  {
    expectedRelativePath: "city-2026.json",
    expectedSlugKey: "city-2026",
    input: "/p/City-2026",
    name: "keeps digits while canonicalizing uppercase input",
  },
];

const invalidCases: InvalidCase[] = [
  {
    input: "/p/%2e%2e/secret",
    name: "rejects encoded traversal segment",
  },
  {
    input: "/p/a/../secret",
    name: "rejects unencoded traversal segment",
  },
  {
    input: "/p/a%2Fb",
    name: "rejects encoded slash after decoding",
  },
  {
    input: "/p/a\\b",
    name: "rejects raw backslash",
  },
  {
    input: "/p/%00bad",
    name: "rejects null byte after decoding",
  },
  {
    input: "/p/%ZZ",
    name: "rejects malformed URI encoding",
  },
  {
    input: "/p/a%20b",
    name: "rejects spaces after decoding",
  },
  {
    input: "/p/a%3Fb",
    name: "rejects question marks after decoding",
  },
  {
    input: "/p/a:b",
    name: "rejects characters that are invalid in Windows file names",
  },
  {
    input: "/p/con",
    name: "rejects Windows reserved file names",
  },
  {
    input: "/p//A/..",
    name: "rejects PRD high-risk sample with dot-dot",
  },
  {
    input: [".."],
    name: "rejects dot-dot segment for array input",
  },
  {
    input: ["PRN"],
    name: "rejects reserved file names for array input",
  },
];

test("normalizePuckSlugInput handles valid slug mappings per PRD", () => {
  for (const validCase of validCases) {
    const normalized = normalizePuckSlugInput(validCase.input);
    assert.equal(normalized.slugKey, validCase.expectedSlugKey, validCase.name);
    assert.equal(normalized.relativeJsonPath, validCase.expectedRelativePath, validCase.name);
  }
});

test("normalizePuckSlugInput rejects traversal and poison slug inputs with SlugValidationError", () => {
  for (const invalidCase of invalidCases) {
    assert.throws(
      () => normalizePuckSlugInput(invalidCase.input),
      (error) => {
        assert.ok(error instanceof SlugValidationError, invalidCase.name);
        assert.equal(error.code, "BAD_REQUEST", invalidCase.name);
        assert.equal(error.status, 400, invalidCase.name);
        return true;
      },
    );
  }
});
