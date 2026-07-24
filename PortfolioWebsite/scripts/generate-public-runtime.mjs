import fs from "node:fs/promises";
import path from "node:path";

import { CONTENT_BUDGET_PROFILE_V1 } from "../src/lib/content-budget.ts";
import { parseCurrentPageDocument } from "../src/lib/page-document-contract.ts";
import { createProjectCatalogProjection } from "../src/lib/project-catalog.ts";
import { PUCK_COMPONENT_TYPES } from "../src/puck/component-manifest.ts";
import {
  createPublicRendererLoaderSource,
  createWorkAliasResolverSource,
} from "../src/puck/public-runtime-codegen.ts";
import { collectPuckComponentTypes } from "../src/puck/runtime-component-types.ts";
import { mapWithConcurrency } from "./lib/bounded-concurrency.mjs";

const projectRoot = process.cwd();
const pagesRoot = path.join(projectRoot, "content/pages");
const outputRoot = path.join(projectRoot, "src/puck/generated");
const checkOnly = process.argv.includes("--check");

async function collectJsonFiles(directory) {
  const directories = [directory];
  const files = [];
  let totalBytes = 0;

  while (directories.length > 0) {
    const currentDirectory = directories.pop();
    const entries = await fs.readdir(currentDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        directories.push(entryPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;

      const stat = await fs.stat(entryPath);
      if (stat.size > CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes) {
        throw new Error(
          `Page JSON exceeds ${CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes} bytes: ${toSlug(entryPath)}`,
        );
      }
      files.push({ filePath: entryPath, size: stat.size });
      totalBytes += stat.size;
      if (files.length > CONTENT_BUDGET_PROFILE_V1.storage.pageCount) {
        throw new Error(
          `Page count exceeds ${CONTENT_BUDGET_PROFILE_V1.storage.pageCount}`,
        );
      }
      if (totalBytes > CONTENT_BUDGET_PROFILE_V1.storage.pageBytes) {
        throw new Error(
          `Page JSON storage exceeds ${CONTENT_BUDGET_PROFILE_V1.storage.pageBytes} bytes`,
        );
      }
    }
  }

  return files.sort((left, right) => left.filePath.localeCompare(right.filePath));
}

function toSlug(filePath) {
  return path.relative(pagesRoot, filePath)
    .replace(/\.json$/i, "")
    .split(path.sep)
    .join("/");
}

function collectOrderedTypes(documents) {
  const usedTypes = new Set();
  documents.forEach((document) => collectPuckComponentTypes(document, usedTypes));
  return PUCK_COMPONENT_TYPES.filter((type) => usedTypes.has(type));
}

const pageInputs = await collectJsonFiles(pagesRoot);
const pageEntries = await mapWithConcurrency(
  pageInputs,
  CONTENT_BUDGET_PROFILE_V1.generator.concurrency,
  async ({ filePath, size }) => {
    const file = await fs.readFile(filePath);
    if (file.byteLength !== size || file.byteLength > CONTENT_BUDGET_PROFILE_V1.pageDocument.maxBytes) {
      throw new Error(`Page JSON changed while reading or exceeded its limit: ${toSlug(filePath)}`);
    }
    return {
      document: parseCurrentPageDocument(JSON.parse(file.toString("utf8"))),
      slug: toSlug(filePath),
    };
  },
);
const pageMap = new Map(pageEntries.map((entry) => [entry.slug, entry.document]));

function requirePage(slug) {
  const document = pageMap.get(slug);
  if (!document) throw new Error(`缺少公开页面内容：${slug}`);
  return document;
}

const routeTargets = [
  {
    documents: [requirePage("index")],
    fileName: "home-public-renderer-loaders.ts",
    functionName: "loadHomePublicRenderer",
    label: "Homepage",
    typesConstantName: "HOME_PUBLIC_RENDERER_TYPES",
  },
  {
    documents: [requirePage("about")],
    fileName: "about-public-renderer-loaders.ts",
    functionName: "loadAboutPublicRenderer",
    label: "About",
    typesConstantName: "ABOUT_PUBLIC_RENDERER_TYPES",
  },
  {
    documents: [requirePage("works")],
    fileName: "works-index-public-renderer-loaders.ts",
    functionName: "loadWorksIndexPublicRenderer",
    label: "Works index",
    typesConstantName: "WORKS_INDEX_PUBLIC_RENDERER_TYPES",
  },
  {
    documents: pageEntries
      .filter(({ slug }) => {
        const segments = slug.split("/");
        return segments.length === 2 &&
          segments[0] === "works" &&
          segments[1] !== "lighting-portfolio";
      })
      .map(({ document }) => document),
    fileName: "work-detail-public-renderer-loaders.ts",
    functionName: "loadWorkDetailPublicRenderer",
    label: "Work detail",
    typesConstantName: "WORK_DETAIL_PUBLIC_RENDERER_TYPES",
  },
  {
    documents: [requirePage("works/lighting-portfolio")],
    fileName: "lighting-index-public-renderer-loaders.ts",
    functionName: "loadLightingIndexPublicRenderer",
    label: "Lighting index",
    typesConstantName: "LIGHTING_INDEX_PUBLIC_RENDERER_TYPES",
  },
  {
    documents: pageEntries
      .filter(({ slug }) => {
        const segments = slug.split("/");
        return segments.length === 3 &&
          segments[0] === "works" &&
          segments[1] === "lighting-portfolio";
      })
      .map(({ document }) => document),
    fileName: "lighting-detail-public-renderer-loaders.ts",
    functionName: "loadLightingDetailPublicRenderer",
    label: "Lighting detail",
    typesConstantName: "LIGHTING_DETAIL_PUBLIC_RENDERER_TYPES",
  },
];

let stale = false;
for (const target of routeTargets) {
  if (target.documents.length === 0) {
    throw new Error(`${target.label} 没有可生成的权威页面文档`);
  }

  const orderedTypes = collectOrderedTypes(target.documents);
  const output = createPublicRendererLoaderSource(orderedTypes, target);
  const outputPath = path.join(outputRoot, target.fileName);
  const currentOutput = await fs.readFile(outputPath, "utf8").catch(() => "");

  if (checkOnly) {
    if (currentOutput !== output) {
      console.error(`${target.label} 公开 renderer 清单已陈旧。`);
      stale = true;
    }
    continue;
  }

  if (currentOutput !== output) {
    await fs.mkdir(outputRoot, { recursive: true });
    await fs.writeFile(outputPath, output, "utf8");
    console.log(`已生成 ${target.label} 公开 renderer：${orderedTypes.join(", ")}`);
  }
}

const workAliasOutput = createWorkAliasResolverSource(
  createProjectCatalogProjection(requirePage("works")).entries,
);
const workAliasOutputPath = path.join(outputRoot, "work-alias-targets.ts");
const currentWorkAliasOutput = await fs.readFile(workAliasOutputPath, "utf8").catch(() => "");
if (checkOnly) {
  if (currentWorkAliasOutput !== workAliasOutput) {
    console.error("作品别名映射已陈旧。");
    stale = true;
  }
} else if (currentWorkAliasOutput !== workAliasOutput) {
  await fs.mkdir(outputRoot, { recursive: true });
  await fs.writeFile(workAliasOutputPath, workAliasOutput, "utf8");
  console.log("已生成作品别名映射。");
}

if (stale) {
  console.error("请运行 npm run generate:public-runtime 更新生成文件。");
  process.exitCode = 1;
}
