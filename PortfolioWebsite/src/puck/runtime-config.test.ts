import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { ComponentConfig } from "@puckeditor/core";
import { createElement } from "react";
import ts from "typescript";

import { createDefaultComponentDesignDocument } from "../lib/component-design-v2.ts";
import {
  migrateLegacyPageDocument,
  parsePageDocument,
  type PageDocument,
} from "../lib/page-document-contract.ts";
import { HOME_PUBLIC_RENDERER_TYPES } from "./generated/home-public-renderer-loaders.ts";
import { resolveGeneratedWorkAlias } from "./generated/work-alias-targets.ts";
import { PUCK_COMPONENT_TYPES } from "./component-manifest.ts";
import { PUBLIC_RENDERER_LOADERS } from "./public-renderer-loaders.ts";
import { PUBLIC_RENDERER_MODULE_NAMES } from "./public-renderer-manifest.ts";
import {
  createPublicRendererLoaderSource,
  createWorkAliasResolverSource,
} from "./public-runtime-codegen.ts";
import { collectPuckComponentTypes } from "./runtime-component-types.ts";
import {
  createPublicRuntimeConfig,
} from "./runtime-config-core.ts";

const TEST_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const fakeRender: ComponentConfig["render"] = () => createElement("div");

function asPageDocument(value: unknown) {
  return migrateLegacyPageDocument(value) as PageDocument;
}

test("public runtime recursively includes only component types used by the page", () => {
  const document = asPageDocument({
    content: [
      {
        props: {
          entries: [
            {
              props: {
                aliases: [],
                category: "Category",
                desc: "Description",
                href: "/works/example",
                id: "entry-1",
                imageSrc: "/images/train-station/2Day.webp",
                number: "01",
                title: "Example",
              },
              type: "WorksListEntry",
            },
          ],
          id: "works-list-1",
        },
        type: "WorksList",
      },
    ],
    root: { props: { title: "Works" } },
    zones: {},
  });

  assert.deepEqual(
    [...collectPuckComponentTypes(document)].sort(),
    ["WorksList", "WorksListEntry"],
  );
});

test("public renderer registry covers every manifest type exactly once", () => {
  assert.deepEqual(
    Object.keys(PUBLIC_RENDERER_LOADERS).sort(),
    [...PUCK_COMPONENT_TYPES].sort(),
  );

  for (const type of PUCK_COMPONENT_TYPES) {
    const moduleName = PUBLIC_RENDERER_MODULE_NAMES[type];
    assert.equal(
      existsSync(join(TEST_DIRECTORY, "public-renderers", `${moduleName}.tsx`)),
      true,
      `${type} must resolve to a dedicated renderer module`,
    );
    assert.match(PUBLIC_RENDERER_LOADERS[type].toString(), new RegExp(moduleName));
  }
});

test("public runtime loads and exposes only types present in the document", async () => {
  const document = asPageDocument({
    content: [
      {
        props: {
          entries: [
            {
              props: { id: "entry-1" },
              type: "WorksListEntry",
            },
          ],
          id: "works-list-1",
        },
        type: "WorksList",
      },
    ],
    root: { props: { title: "Works" } },
    zones: {},
  });
  const loadedTypes: string[] = [];
  const runtimeConfig = await createPublicRuntimeConfig(document, {
    loadRenderer: async (type) => {
      loadedTypes.push(type);
      return fakeRender;
    },
  });

  assert.deepEqual(loadedTypes.sort(), ["WorksList", "WorksListEntry"]);
  assert.deepEqual(Object.keys(runtimeConfig.components).sort(), loadedTypes);
  for (const component of Object.values(runtimeConfig.components)) {
    assert.deepEqual(Object.keys(component), ["render"]);
  }
});

test("homepage runtime accepts any legal manifest component instead of a fixed whitelist", async () => {
  const homepage = asPageDocument({
    content: [
      { props: { id: "hero" }, type: "HeroSection" },
      { props: { id: "statement" }, type: "StatementBlock" },
    ],
    root: { props: { title: "Home" } },
    zones: {},
  });
  const loadedTypes: string[] = [];
  const runtimeConfig = await createPublicRuntimeConfig(homepage, {
    loadRenderer: async (type) => {
      loadedTypes.push(type);
      return fakeRender;
    },
  });

  assert.deepEqual(loadedTypes.sort(), ["HeroSection", "StatementBlock"]);
  assert.deepEqual(Object.keys(runtimeConfig.components).sort(), loadedTypes);
});

test("homepage loader generation automatically includes a newly added legal component", () => {
  const source = createPublicRendererLoaderSource(
    ["HeroSection", "StatementBlock"],
    {
      functionName: "loadHomePublicRenderer",
      label: "Homepage",
      typesConstantName: "HOME_PUBLIC_RENDERER_TYPES",
    },
  );

  assert.match(
    source,
    /StatementBlock: \(\) => import\("\.\.\/public-renderers\/statement-block"\)/,
  );
  assert.match(source, /"StatementBlock"/);
});

test("public runtime never imports the complete renderer registry", () => {
  const source = readFileSync(
    join(TEST_DIRECTORY, "runtime-config-core.ts"),
    "utf8",
  );

  assert.doesNotMatch(source, /public-renderer-loaders/);
  assert.match(source, /await loadRenderer\(type\)/);
});

test("generated work alias resolver is pure, stable, and covers current aliases", () => {
  const source = createWorkAliasResolverSource([
    { aliases: ["z-old", "a-old"], id: "current" },
  ]);
  assert.ok(source.indexOf('"a-old": "current"') < source.indexOf('"z-old": "current"'));
  assert.equal(resolveGeneratedWorkAlias("holy-tank"), "wow-otto");
  assert.equal(resolveGeneratedWorkAlias("penguin-trading-company"), "penguin");
  assert.equal(resolveGeneratedWorkAlias("penguin"), null);
});

test("generated homepage loader stays aligned with the authoritative homepage document", () => {
  const homepagePath = join(TEST_DIRECTORY, "../../content/pages/index.json");
  const homepage = parsePageDocument(JSON.parse(readFileSync(homepagePath, "utf8")));
  const usedTypes = collectPuckComponentTypes(homepage);
  const expectedTypes = PUCK_COMPONENT_TYPES.filter((type) => usedTypes.has(type));

  assert.deepEqual([...HOME_PUBLIC_RENDERER_TYPES], expectedTypes);
});

test("runtime injects V2 layout only into author components", async () => {
  const document = asPageDocument({
    content: [
      { props: { id: "statement" }, type: "StatementBlock" },
      { props: { id: "metadata" }, type: "MetadataListItem" },
      { props: { entries: [], id: "works-list" }, type: "WorksList" },
    ],
    root: { props: { title: "Design" } },
    zones: {},
  });
  const designDocument = createDefaultComponentDesignDocument();
  const runtimeConfig = await createPublicRuntimeConfig(document, {
    designDocument,
    loadRenderer: async () => fakeRender,
  });

  const statement = (runtimeConfig.components.StatementBlock.render as unknown as () => ReturnType<typeof createElement>)();
  const metadata = (runtimeConfig.components.MetadataListItem.render as unknown as () => ReturnType<typeof createElement>)();
  const worksList = (runtimeConfig.components.WorksList.render as unknown as () => ReturnType<typeof createElement>)();
  assert.deepEqual(
    (statement.props as { componentLayout?: unknown }).componentLayout,
    designDocument.components.StatementBlock.variants.medium,
  );
  assert.equal(
    (metadata.props as { componentLayout?: unknown }).componentLayout,
    undefined,
  );
  assert.deepEqual(
    (worksList.props as { componentLayout?: unknown }).componentLayout,
    designDocument.components.WorksList.variants.default,
  );
});

test("public runtime only preloads media declared visible in the first viewport", async () => {
  const echoRender: ComponentConfig["render"] = (props) =>
    createElement("div", props);
  const heroDocument = asPageDocument({
    content: [
      {
        props: {
          id: "hero",
          imageSrc: "/images/insight/InsightCover.webp",
        },
        type: "HeroSection",
      },
    ],
    root: { props: { title: "Hero" } },
    zones: {},
  });
  const heroConfig = await createPublicRuntimeConfig(heroDocument, {
    loadRenderer: async () => echoRender,
  });
  const hero = (
    heroConfig.components.HeroSection.render as unknown as (
      props: Record<string, unknown>,
    ) => ReturnType<typeof createElement>
  )(heroDocument.content[0].props);
  assert.deepEqual(
    (hero.props as { publicMediaHint?: unknown }).publicMediaHint,
    {
      height: 900,
      preload: true,
      profile: "full-bleed",
      sizes: "100vw",
      src: "/images/insight/InsightCover.webp",
      width: 1600,
    },
  );

  const worksDocument = asPageDocument({
    content: [
      {
        props: {
          entries: [
            {
              props: {
                id: "entry",
                imageSrc: "/images/train-station/2Day.webp",
              },
              type: "WorksListEntry",
            },
          ],
          id: "works",
        },
        type: "WorksList",
      },
    ],
    root: { props: { title: "Works" } },
    zones: {},
  });
  const worksConfig = await createPublicRuntimeConfig(worksDocument, {
    loadRenderer: async () => echoRender,
  });
  const works = (
    worksConfig.components.WorksList.render as unknown as (
      props: Record<string, unknown>,
    ) => ReturnType<typeof createElement>
  )(worksDocument.content[0].props);
  assert.equal(
    (works.props as { publicMediaHint?: unknown }).publicMediaHint,
    undefined,
  );
});

test("public runtime source has no editor config, field, or default-prop dependency", () => {
  const rendererDirectory = join(TEST_DIRECTORY, "public-renderers");
  const sourcePaths = [
    join(TEST_DIRECTORY, "public-renderer-loaders.ts"),
    join(TEST_DIRECTORY, "public-renderer-manifest.ts"),
    join(TEST_DIRECTORY, "public-runtime-codegen.ts"),
    join(TEST_DIRECTORY, "runtime-config-core.ts"),
    join(TEST_DIRECTORY, "runtime-config.ts"),
    ...readdirSync(join(TEST_DIRECTORY, "generated"))
      .filter((name) => name.endsWith(".ts"))
      .map((name) => join(TEST_DIRECTORY, "generated", name)),
    ...readdirSync(rendererDirectory)
      .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
      .map((name) => join(rendererDirectory, name)),
  ];

  for (const sourcePath of sourcePaths) {
    const sourceText = readFileSync(sourcePath, "utf8");
    const sourceFile = ts.createSourceFile(
      sourcePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      sourcePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    const assertAllowedDependency = (specifier: string) => {
        assert.doesNotMatch(
          specifier,
          /(?:^|\/|@\/puck\/)(?:config|fields)(?:\/|$)/,
          `${sourcePath} must not import editor-only dependency ${specifier}`,
        );
    };

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        assertAllowedDependency(node.moduleSpecifier.text);
      }
      if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        assertAllowedDependency(node.moduleSpecifier.text);
      }
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        assertAllowedDependency(node.arguments[0].text);
      }

      if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
        const name = node.name && ts.isIdentifier(node.name) ? node.name.text : "";
        assert.notEqual(name, "fields", `${sourcePath} must remain render-only`);
        assert.notEqual(name, "defaultProps", `${sourcePath} must remain render-only`);
      }

      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
});
