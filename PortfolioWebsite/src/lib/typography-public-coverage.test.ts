import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

import {
  type ComponentDesignComponentKey,
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument,
  type ComponentDesignDocument,
} from "./component-design-schema.ts";
import {
  getDefaultTypographySemanticWeight,
  isTypographyFontLabSizeSupported,
} from "./typography-tokens.ts";
import { isTypographyPreset, isTypographySize } from "./typography.ts";

type Candidate = {
  conditions: Readonly<Record<string, boolean>>;
  value: string;
};

type TypographyUsage = {
  presets: Candidate[];
  sizes: Candidate[];
  weights: Candidate[];
};

function loadComponentDesignDocument(): ComponentDesignDocument {
  const filePath = path.resolve(
    process.cwd(),
    "content/component-design/component-design.json",
  );

  return fs.existsSync(filePath)
    ? normalizeComponentDesignDocument(
        JSON.parse(fs.readFileSync(filePath, "utf8")),
      )
    : createDefaultComponentDesignDocument();
}

const COMPONENT_DESIGN_DOCUMENT = loadComponentDesignDocument();

function collectPublicTsxFiles() {
  const files: string[] = [];

  function walk(directory: string) {
    if (!fs.existsSync(directory)) return;

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (
          fullPath.includes(`${path.sep}playground`) ||
          fullPath.includes(`${path.sep}admin`) ||
          fullPath.includes(`${path.sep}api`)
        ) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile() && fullPath.endsWith(".tsx")) {
        files.push(fullPath);
      }
    }
  }

  walk(path.resolve(process.cwd(), "src/components"));
  walk(path.resolve(process.cwd(), "src/app"));
  return files;
}

function collectVariables(sourceFile: ts.SourceFile) {
  const variables = new Map<string, ts.Expression>();

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      variables.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return variables;
}

function resolveDesignBinding(sourceFile: ts.SourceFile): {
  key: ComponentDesignComponentKey;
  variableName: string;
} | null {
  let result: {
    key: ComponentDesignComponentKey;
    variableName: string;
  } | null = null;

  function visit(node: ts.Node) {
    if (result) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ["resolveComponentDesign", "useComponentDesign"].includes(
        node.initializer.expression.getText(sourceFile),
      )
    ) {
      const argument = node.initializer.arguments[0];
      if (
        argument &&
        ts.isStringLiteralLike(argument) &&
        argument.text in COMPONENT_DESIGN_DOCUMENT.components
      ) {
        result = {
          key: argument.text as ComponentDesignComponentKey,
          variableName: node.name.text,
        };
        return;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return result;
}

function withCondition(
  candidate: Candidate,
  key: string,
  value: boolean,
): Candidate | null {
  const existing = candidate.conditions[key];
  if (existing !== undefined && existing !== value) return null;
  return {
    conditions: { ...candidate.conditions, [key]: value },
    value: candidate.value,
  };
}

function evaluateExpression(
  expression: ts.Expression,
  sourceFile: ts.SourceFile,
  variables: ReadonlyMap<string, ts.Expression>,
  resolveProperty: (pathName: string) => string[],
  resolving = new Set<string>(),
): Candidate[] {
  if (ts.isStringLiteralLike(expression)) {
    return [{ conditions: {}, value: expression.text }];
  }

  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isSatisfiesExpression(expression)
  ) {
    return evaluateExpression(
      expression.expression,
      sourceFile,
      variables,
      resolveProperty,
      resolving,
    );
  }

  if (ts.isConditionalExpression(expression)) {
    const key = expression.condition.getText(sourceFile);
    const branch = (node: ts.Expression, value: boolean) =>
      evaluateExpression(node, sourceFile, variables, resolveProperty, resolving)
        .map((candidate) => withCondition(candidate, key, value))
        .filter((candidate): candidate is Candidate => candidate !== null);

    return [
      ...branch(expression.whenTrue, true),
      ...branch(expression.whenFalse, false),
    ];
  }

  if (ts.isIdentifier(expression)) {
    if (resolving.has(expression.text)) return [];
    const initializer = variables.get(expression.text);
    if (!initializer) return [];

    const nextResolving = new Set(resolving);
    nextResolving.add(expression.text);
    return evaluateExpression(
      initializer,
      sourceFile,
      variables,
      resolveProperty,
      nextResolving,
    );
  }

  if (ts.isPropertyAccessExpression(expression)) {
    return resolveProperty(expression.getText(sourceFile)).map((value) => ({
      conditions: {},
      value,
    }));
  }

  return [];
}

function readAttribute(
  element: ts.JsxOpeningLikeElement,
  name: string,
  sourceFile: ts.SourceFile,
  variables: ReadonlyMap<string, ts.Expression>,
  resolveProperty: (pathName: string) => string[],
): Candidate[] {
  const attribute = element.attributes.properties.find(
    (property): property is ts.JsxAttribute =>
      ts.isJsxAttribute(property) && property.name.getText(sourceFile) === name,
  );

  if (!attribute?.initializer) return [];
  if (ts.isStringLiteral(attribute.initializer)) {
    return [{ conditions: {}, value: attribute.initializer.text }];
  }
  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
    return evaluateExpression(
      attribute.initializer.expression,
      sourceFile,
      variables,
      resolveProperty,
    );
  }
  return [];
}

function collectTypographyUsages(filePath: string): TypographyUsage[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const variables = collectVariables(sourceFile);
  const designBinding = resolveDesignBinding(sourceFile);
  const usages: TypographyUsage[] = [];

  const resolveProperty = (pathName: string) => {
    if (!designBinding || !pathName.startsWith(`${designBinding.variableName}.`)) return [];
    const field = pathName.slice(designBinding.variableName.length + 1);
    const value =
      COMPONENT_DESIGN_DOCUMENT.components[designBinding.key][
        field as keyof (typeof COMPONENT_DESIGN_DOCUMENT.components)[typeof designBinding.key]
      ];
    return typeof value === "string" ? [value] : [];
  };

  function visit(node: ts.Node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(sourceFile) === "Typography"
    ) {
      usages.push({
        presets: readAttribute(node, "preset", sourceFile, variables, resolveProperty),
        sizes: readAttribute(node, "size", sourceFile, variables, resolveProperty),
        weights: readAttribute(node, "weight", sourceFile, variables, resolveProperty),
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return usages;
}

function compatible(left: Candidate, right: Candidate) {
  return Object.entries(left.conditions).every(
    ([key, value]) =>
      right.conditions[key] === undefined || right.conditions[key] === value,
  );
}

function combine(left: Candidate[], right: Candidate[]) {
  return left.flatMap((leftCandidate) =>
    right
      .filter((rightCandidate) => compatible(leftCandidate, rightCandidate))
      .map((rightCandidate) => [leftCandidate.value, rightCandidate.value] as const),
  );
}

test("public typography usage stays inside the FontLab coverage matrix", () => {
  for (const filePath of collectPublicTsxFiles()) {
    const relativePath = path.relative(process.cwd(), filePath);

    for (const usage of collectTypographyUsages(filePath)) {
      assert.ok(usage.presets.length > 0, `${relativePath} 存在无法静态解析 preset 的 Typography`);
      assert.ok(usage.sizes.length > 0, `${relativePath} 存在无法静态解析 size 的 Typography`);

      const combinations = combine(usage.presets, usage.sizes);
      assert.ok(combinations.length > 0, `${relativePath} 的 Typography 没有可达 preset/size 组合`);

      for (const [preset, size] of combinations) {
        assert.ok(
          isTypographyPreset(preset) && isTypographySize(size),
          `${relativePath} 使用了非法 Typography 组合 ${preset}/${size}`,
        );
        assert.equal(
          isTypographyFontLabSizeSupported(preset, size),
          true,
          `${relativePath} 的 Typography 组合 ${preset}/${size} 不在 FontLab 可配置矩阵内`,
        );
      }
    }
  }
});

test("public typography uses semantic weight whenever it matches the default semantic slot", () => {
  for (const filePath of collectPublicTsxFiles()) {
    const relativePath = path.relative(process.cwd(), filePath);

    for (const usage of collectTypographyUsages(filePath)) {
      for (const [size, weight] of combine(usage.sizes, usage.weights)) {
        if (weight === "semantic" || !isTypographySize(size)) continue;

        assert.notEqual(
          weight,
          getDefaultTypographySemanticWeight(size),
          `${relativePath} 的 Typography 使用了 ${size}/${weight}，应改为 weight="semantic" 以保持配置文件统一驱动`,
        );
      }
    }
  }
});

test("typography margin reset stays below alignment utility specificity", () => {
  const globalsCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/globals.css"),
    "utf8",
  );

  assert.match(globalsCss, /:where\(\.typography-root\)\s*\{\s*margin:\s*0;/);
  assert.doesNotMatch(globalsCss, /(?:^|\n)\.typography-root\s*\{\s*margin:\s*0;/);
});

test("route font scopes resolve every Typography alias beside their font sources", () => {
  const globalsCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/globals.css"),
    "utf8",
  );
  const scopeBlock = globalsCss.match(/\[data-font-scope\]\s*\{([^}]*)\}/)?.[1];

  assert.ok(
    scopeBlock,
    "公开站点与创作工具分离字体源后，必须在同级字体作用域重新解析 Typography 别名",
  );

  const expectedAliases = {
    "--font-latin-sans": "--font-futura",
    "--font-cjk-sans": "--font-han-yi-qi-hei",
    "--font-latin-editorial": "--font-luna",
    "--font-cjk-editorial": "--font-noto-serif",
    "--font-latin-gothic": "--font-gothic",
    "--font-latin-classical": "--font-dm-serif",
    "--font-cjk-classical": "--font-noto-serif",
  };

  for (const [alias, source] of Object.entries(expectedAliases)) {
    assert.match(
      scopeBlock,
      new RegExp(`${alias}:\\s*var\\(${source}\\)`),
      `${alias} 必须在 data-font-scope 上解析 ${source}，否则浏览器会退回系统字体`,
    );
  }
});
